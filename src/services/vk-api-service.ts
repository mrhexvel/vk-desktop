import type { APIServiceOptions, BatchRequest, CacheEntry } from "../types/chat"
import type { VKConversationsResponse, VKGroup, VKHistoryResponse, VKProfile } from "../types/vk-api"

export class VKAPIService {
  private static instance: VKAPIService
  private requestQueue: BatchRequest[] = []
  private isProcessing = false
  private readonly BATCH_SIZE: number
  private readonly BATCH_DELAY: number

  private readonly REQUEST_DELAY: number
  private lastRequestTime = 0

  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private readonly CACHE_TTL: number

  private profilesCache: Map<number, VKProfile> = new Map()
  private groupsCache: Map<number, VKGroup> = new Map()

  constructor(options: APIServiceOptions = {}) {
    this.BATCH_SIZE = options.batchSize || 25
    this.BATCH_DELAY = 100
    this.REQUEST_DELAY = options.rateLimit || 350
    this.CACHE_TTL = options.cacheTime || 5 * 60 * 1000
  }

  static getInstance(options?: APIServiceOptions): VKAPIService {
    if (!VKAPIService.instance) {
      VKAPIService.instance = new VKAPIService(options)
    }
    return VKAPIService.instance
  }

  async queueRequest<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({
        method,
        params,
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      this.processBatch()
    })
  }

  async directRequest<T>(method: string, params: Record<string, unknown> = {}, useCache = true): Promise<T> {
    const cacheKey = this.generateCacheKey(method, params)

    if (useCache) {
      const cachedData = this.getFromCache<T>(cacheKey)
      if (cachedData) {
        console.log(`[VK API] Cache hit for ${method}`)
        return cachedData
      }
    }

    await this.rateLimit()

    try {
      console.log(`[VK API] Requesting ${method}`)
      const result = (await window.api.callVKAPI(method, params)) as T

      if (useCache) {
        this.saveToCache<T>(cacheKey, result)
      }

      this.updateProfilesAndGroupsCache(result)

      return result
    } catch (error) {
      const errorObj = error as Error
      if (errorObj.message && errorObj.message.includes("Too many requests per second")) {
        console.warn(`[VK API] Rate limit exceeded for ${method}, retrying after delay...`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return this.directRequest<T>(method, params, useCache)
      }

      console.error(`[VK API] Request failed for ${method}:`, error)
      throw error
    }
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      const delay = this.REQUEST_DELAY - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    this.lastRequestTime = Date.now()
  }

  private generateCacheKey(method: string, params: Record<string, unknown>): string {
    return `${method}:${JSON.stringify(params)}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private saveToCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private updateProfilesAndGroupsCache(response: unknown): void {
    const typedResponse = response as {
      profiles?: VKProfile[]
      groups?: VKGroup[]
      conversations?: {
        profiles?: VKProfile[]
        groups?: VKGroup[]
      }
      history?: {
        profiles?: VKProfile[]
        groups?: VKGroup[]
      }
      additional_profiles?: VKProfile[]
      additional_groups?: VKGroup[]
    }

    if (typedResponse.profiles && Array.isArray(typedResponse.profiles)) {
      typedResponse.profiles.forEach((profile) => {
        if (profile && profile.id) {
          this.profilesCache.set(profile.id, profile)
        }
      })
    }

    if (typedResponse.groups && Array.isArray(typedResponse.groups)) {
      typedResponse.groups.forEach((group) => {
        if (group && group.id) {
          this.groupsCache.set(group.id, group)
        }
      })
    }

    if (typedResponse.conversations && typedResponse.conversations.profiles) {
      this.updateProfilesAndGroupsCache(typedResponse.conversations)
    }

    if (typedResponse.history && typedResponse.history.profiles) {
      this.updateProfilesAndGroupsCache(typedResponse.history)
    }

    if (typedResponse.additional_profiles) {
      typedResponse.additional_profiles.forEach((profile) => {
        if (profile && profile.id) {
          this.profilesCache.set(profile.id, profile)
        }
      })
    }

    if (typedResponse.additional_groups) {
      typedResponse.additional_groups.forEach((group) => {
        if (group && group.id) {
          this.groupsCache.set(group.id, group)
        }
      })
    }
  }

  async getProfile(userId: number): Promise<VKProfile | null> {
    if (this.profilesCache.has(userId)) {
      return this.profilesCache.get(userId) || null
    }

    try {
      const profiles = await this.directRequest<VKProfile[]>("users.get", {
        user_ids: userId,
        fields: "photo_100,online,last_seen",
      })

      if (profiles && profiles.length > 0) {
        const profile = profiles[0]
        this.profilesCache.set(userId, profile)
        return profile
      }
    } catch (error) {
      console.error(`Failed to get profile for user ${userId}:`, error)
    }

    return null
  }

  async getGroup(groupId: number): Promise<VKGroup | null> {
    if (this.groupsCache.has(groupId)) {
      return this.groupsCache.get(groupId) || null
    }

    try {
      const groups = await this.directRequest<VKGroup[]>("groups.getById", {
        group_ids: groupId,
        fields: "photo_100",
      })

      if (groups && groups.length > 0) {
        const group = groups[0]
        this.groupsCache.set(groupId, group)
        return group
      }
    } catch (error) {
      console.error(`Failed to get group ${groupId}:`, error)
    }

    return null
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return
    }

    this.isProcessing = true

    await new Promise((resolve) => setTimeout(resolve, this.BATCH_DELAY))

    while (this.requestQueue.length > 0) {
      const batch = this.requestQueue.splice(0, this.BATCH_SIZE)
      await this.executeBatch(batch)
    }

    this.isProcessing = false
  }

  private async executeBatch(batch: BatchRequest[]): Promise<void> {
    if (batch.length === 0) return

    try {
      if (batch.length === 1) {
        const { method, params, resolve, reject } = batch[0]
        try {
          const result = await this.directRequest(method, params)
          resolve(result)
        } catch (error) {
          reject(error)
        }
        return
      }

      const vkScriptCode = this.generateVKScript(batch)

      console.log("[VK API] Executing batch of", batch.length, "requests")

      const results = await this.directRequest<unknown[]>("execute", { code: vkScriptCode }, false)

      if (Array.isArray(results)) {
        results.forEach((result, index) => {
          if (index < batch.length) {
            const typedResult = result as { error?: { error_msg: string } } | false
            if (typedResult === false || (typedResult && typedResult.error)) {
              batch[index].reject(
                new Error(typedResult && typedResult.error ? typedResult.error.error_msg : "API request failed"),
              )
            } else {
              batch[index].resolve(result)
            }
          }
        })
      } else {
        batch.forEach(({ reject }) => {
          reject(new Error("Unexpected execute response format"))
        })
      }
    } catch (error) {
      console.error("[VK API] Batch execution failed:", error)
      batch.forEach(({ reject }) => {
        reject(error)
      })
    }
  }

  private generateVKScript(batch: BatchRequest[]): string {
    const apiCalls = batch.map((request) => {
      const paramsStr = Object.entries(request.params)
        .map(([key, value]) => {
          if (typeof value === "string") {
            return `"${key}": "${value.replace(/"/g, '\\"')}"`
          }
          return `"${key}": ${JSON.stringify(value)}`
        })
        .join(", ")

      return `API.${request.method}({${paramsStr}})`
    })

    return `return [${apiCalls.join(", ")}];`
  }

  async getConversations(
    count = 20,
    offset = 0,
  ): Promise<{
    conversations: VKConversationsResponse
    additional_profiles: VKProfile[]
    additional_groups: VKGroup[]
  }> {
    try {
      const cacheKey = this.generateCacheKey("messages.getConversations", { count, offset })
      const cachedData = this.getFromCache<{
        conversations: VKConversationsResponse
        additional_profiles: VKProfile[]
        additional_groups: VKGroup[]
      }>(cacheKey)

      if (cachedData) {
        console.log("[VK API] Using cached conversations")
        return cachedData
      }

      const conversations = await this.directRequest<VKConversationsResponse>(
        "messages.getConversations",
        {
          count,
          offset,
          extended: 1,
          fields: "photo_100,online,last_seen",
        },
        false,
      )

      if (!conversations || !conversations.items) {
        throw new Error("No conversations found")
      }

      const userIds = new Set<number>()
      const groupIds = new Set<number>()

      conversations.items.forEach((item) => {
        const peer = item.conversation.peer
        if (peer.type === "user") {
          userIds.add(peer.id)
        } else if (peer.type === "group") {
          groupIds.add(-peer.id)
        }

        if (item.last_message) {
          const fromId = item.last_message.from_id
          if (fromId > 0) {
            userIds.add(fromId)
          } else if (fromId < 0) {
            groupIds.add(-fromId)
          }
        }
      })

      const userIdsToFetch = Array.from(userIds).filter((id) => !this.profilesCache.has(id))
      const groupIdsToFetch = Array.from(groupIds).filter((id) => !this.groupsCache.has(id))

      let additionalProfiles: VKProfile[] = []
      let additionalGroups: VKGroup[] = []

      if (userIdsToFetch.length > 0) {
        for (let i = 0; i < userIdsToFetch.length; i += 100) {
          const batch = userIdsToFetch.slice(i, i + 100)
          const profiles = await this.directRequest<VKProfile[]>("users.get", {
            user_ids: batch.join(","),
            fields: "photo_100,online,last_seen",
          })

          if (profiles && Array.isArray(profiles)) {
            additionalProfiles = [...additionalProfiles, ...profiles]
          }

          if (i + 100 < userIdsToFetch.length) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }
      }

      if (groupIdsToFetch.length > 0) {
        for (let i = 0; i < groupIdsToFetch.length; i += 100) {
          const batch = groupIdsToFetch.slice(i, i + 100)
          const groups = await this.directRequest<VKGroup[]>("groups.getById", {
            group_ids: batch.join(","),
            fields: "photo_100",
          })

          if (groups && Array.isArray(groups)) {
            additionalGroups = [...additionalGroups, ...groups]
          }

          if (i + 100 < groupIdsToFetch.length) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }
      }

      const result = {
        conversations,
        additional_profiles: additionalProfiles,
        additional_groups: additionalGroups,
      }

      this.saveToCache(cacheKey, result)

      this.updateProfilesAndGroupsCache(result)

      return result
    } catch (error) {
      console.error("[VK API] Error in getConversations:", error)
      throw error
    }
  }

  async getHistory(
    peerId: number,
    count = 50,
    offset = 0,
  ): Promise<{
    history: VKHistoryResponse
    additional_profiles: VKProfile[]
    additional_groups: VKGroup[]
  }> {
    try {
      const cacheKey = this.generateCacheKey("messages.getHistory", { peer_id: peerId, count, offset })
      const cachedData = this.getFromCache<{
        history: VKHistoryResponse
        additional_profiles: VKProfile[]
        additional_groups: VKGroup[]
      }>(cacheKey)

      if (cachedData) {
        console.log("[VK API] Using cached history for peer", peerId)
        return cachedData
      }

      const history = await this.directRequest<VKHistoryResponse>(
        "messages.getHistory",
        {
          peer_id: peerId,
          count,
          offset,
          extended: 1,
          fields: "photo_100,online,last_seen",
        },
        false,
      )

      if (!history || !history.items) {
        throw new Error("No messages found")
      }

      const userIds = new Set<number>()
      const groupIds = new Set<number>()

      history.items.forEach((item) => {
        const fromId = item.from_id
        if (fromId > 0) {
          userIds.add(fromId)
        } else if (fromId < 0) {
          groupIds.add(-fromId)
        }
      })

      const userIdsToFetch = Array.from(userIds).filter((id) => !this.profilesCache.has(id))
      const groupIdsToFetch = Array.from(groupIds).filter((id) => !this.groupsCache.has(id))

      let additionalProfiles: VKProfile[] = []
      let additionalGroups: VKGroup[] = []

      if (userIdsToFetch.length > 0) {
        for (let i = 0; i < userIdsToFetch.length; i += 100) {
          const batch = userIdsToFetch.slice(i, i + 100)
          const profiles = await this.directRequest<VKProfile[]>("users.get", {
            user_ids: batch.join(","),
            fields: "photo_100,online,last_seen",
          })

          if (profiles && Array.isArray(profiles)) {
            additionalProfiles = [...additionalProfiles, ...profiles]
          }

          if (i + 100 < userIdsToFetch.length) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }
      }

      if (groupIdsToFetch.length > 0) {
        for (let i = 0; i < groupIdsToFetch.length; i += 100) {
          const batch = groupIdsToFetch.slice(i, i + 100)
          const groups = await this.directRequest<VKGroup[]>("groups.getById", {
            group_ids: batch.join(","),
            fields: "photo_100",
          })

          if (groups && Array.isArray(groups)) {
            additionalGroups = [...additionalGroups, ...groups]
          }

          if (i + 100 < groupIdsToFetch.length) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }
      }

      const result = {
        history,
        additional_profiles: additionalProfiles,
        additional_groups: additionalGroups,
      }

      this.saveToCache(cacheKey, result)

      this.updateProfilesAndGroupsCache(result)

      return result
    } catch (error) {
      console.error("[VK API] Error in getHistory:", error)
      throw error
    }
  }

  clearCache(): void {
    this.cache.clear()
    console.log("[VK API] Cache cleared")
  }

  clearCacheForMethod(method: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${method}:`)) {
        this.cache.delete(key)
      }
    }
    console.log(`[VK API] Cache cleared for method ${method}`)
  }
}

export const vkAPI = VKAPIService.getInstance()
