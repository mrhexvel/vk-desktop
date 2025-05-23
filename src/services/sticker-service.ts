import type { Sticker, StickerImageConfigs } from "../types/chat"

let stickerConfigsCache: StickerImageConfigs | null = null
let stickerConfigsHash: string | null = null

const STICKER_API_URL = "https://vk.com/sticker"
const STICKER_FALLBACK_URL = "/colorful-sticker.png"

export async function checkStickerConfigsUpdate(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.vk.com/method/store.hasNewItems?type=stickers_image_configs&access_token=${accessToken}&v=5.199`,
    )
    const data = await response.json()

    if (data.error) {
      console.warn("Error checking sticker configs update:", data.error.error_msg)
      return false
    }

    if (!data.response) {
      return false
    }

    return !stickerConfigsHash || data.response.hash !== stickerConfigsHash
  } catch (error) {
    console.error("Error checking sticker configs update:", error)
    return false
  }
}

export async function getStickerConfigs(accessToken: string): Promise<StickerImageConfigs | null> {
  if (stickerConfigsCache) {
    return stickerConfigsCache
  }

  try {
    const response = await fetch(
      `https://api.vk.com/method/store.getStickersImageConfigs?access_token=${accessToken}&v=5.199`,
    )
    const data = await response.json()

    if (data.error) {
      console.warn("Error getting sticker configs:", data.error.error_msg)
      return null
    }

    if (!data.response) {
      return null
    }

    stickerConfigsCache = data.response
    stickerConfigsHash = data.response.hash

    console.log("Loaded sticker configs:", data.response)
    return data.response
  } catch (error) {
    console.error("Error getting sticker configs:", error)
    return null
  }
}

export function getStickerUrl(sticker: Sticker, size = 256): string {
  console.log("Getting sticker URL for:", sticker)

  if (sticker.images && sticker.images.length > 0) {
    console.log("Using sticker.images")
    const closestImage = sticker.images.reduce((prev, curr) => {
      return Math.abs(curr.width - size) < Math.abs(prev.width - size) ? curr : prev
    })
    return closestImage.url
  }

  if (sticker.images_with_background && sticker.images_with_background.length > 0) {
    console.log("Using sticker.images_with_background")
    const closestImage = sticker.images_with_background.reduce((prev, curr) => {
      return Math.abs(curr.width - size) < Math.abs(prev.width - size) ? curr : prev
    })
    return closestImage.url
  }

  const stickerId = sticker.sticker_id || 0

  if (stickerId) {
    const url = `${STICKER_API_URL}/1-${stickerId}-${size}b`
    console.log("Using correct sticker URL format:", url)
    return url
  }

  console.log("Using fallback URL")
  return STICKER_FALLBACK_URL
}

export async function initStickerService(accessToken: string): Promise<void> {
  try {
    console.log("Initializing sticker service...")
    const needsUpdate = await checkStickerConfigsUpdate(accessToken)
    if (needsUpdate) {
      console.log("Updating sticker configs...")
      await getStickerConfigs(accessToken)
    } else {
      console.log("Sticker configs are up to date")
    }
  } catch (error) {
    console.error("Error initializing sticker service:", error)
  }
}

export function getAllPossibleStickerUrls(sticker: Sticker, size = 256): string[] {
  const stickerId = sticker.sticker_id || 0
  const productId = sticker.product_id || 0

  const urls: string[] = []

  if (sticker.images && sticker.images.length > 0) {
    sticker.images.forEach((img) => urls.push(img.url))
  }

  if (sticker.images_with_background && sticker.images_with_background.length > 0) {
    sticker.images_with_background.forEach((img) => urls.push(img.url))
  }

  if (stickerId) {
    urls.push(`${STICKER_API_URL}/1-${stickerId}-${size}b`)
  }

  if (stickerId && productId) {
    urls.push(`${STICKER_API_URL}/1-${productId}-${stickerId}-${size}b`)
  }

  urls.push(STICKER_FALLBACK_URL)

  return urls
}
