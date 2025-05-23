import type { VKBaseResponse } from "./api"

export interface SessionUserInfo {
  firstName: string
  lastName: string
  photoUrl: string
  username?: string
  password?: string
}

export interface SessionUser {
  access_token: string
  user_id: number
  userInfo: SessionUserInfo
}

export interface User {
  id: number
  first_name: string
  last_name: string
  deactivated?: string
  hidden?: 0 | 1
  verified?: 0 | 1
  blacklisted?: 0 | 1
  sex?: 0 | 1 | 2
  bdate?: string
  city?: {
    id: number
    title: string
  }
  country?: {
    id: number
    title: string
  }
  photo_50?: string
  photo_100?: string
  photo_200?: string
  photo_max?: string
  photo_200_orig?: string
  photo_400_orig?: string
  photo_max_orig?: string
  online?: 0 | 1
  online_mobile?: 0 | 1
  online_app?: number
  domain?: string
  has_mobile?: 0 | 1
  contacts?: {
    mobile_phone?: string
    home_phone?: string
  }
  site?: string
  education?: {
    university?: number
    university_name?: string
    faculty?: number
    faculty_name?: string
    graduation?: number
  }
  universities?: Array<{
    id: number
    country: number
    city: number
    name: string
    faculty: number
    faculty_name: string
    chair: number
    chair_name: string
    graduation: number
    education_form: string
    education_status: string
  }>
  schools?: Array<{
    id: number
    country: number
    city: number
    name: string
    year_from: number
    year_to: number
    year_graduated: number
    class: string
    speciality: string
    type: number
    type_str: string
  }>
  status?: string
  last_seen?: {
    time: number
    platform: number
  }
  followers_count?: number
  counters?: {
    albums?: number
    videos?: number
    audios?: number
    photos?: number
    notes?: number
    friends?: number
    groups?: number
    online_friends?: number
    mutual_friends?: number
    user_videos?: number
    followers?: number
    pages?: number
  }
  occupation?: {
    type: "work" | "school" | "university"
    id: number
    name: string
  }
  nickname?: string
  relatives?: Array<{
    id: number
    name: string
    type: string
  }>
  relation?: number
  personal?: {
    political?: number
    langs?: string[]
    religion?: string
    inspired_by?: string
    people_main?: number
    life_main?: number
    smoking?: number
    alcohol?: number
  }
  connections?: {
    skype?: string
    facebook?: string
    twitter?: string
    livejournal?: string
    instagram?: string
  }
  exports?: {
    facebook?: number
    livejournal?: number
    twitter?: number
    instagram?: number
  }
  wall_comments?: 0 | 1
  activities?: string
  interests?: string
  music?: string
  movies?: string
  tv?: string
  books?: string
  games?: string
  about?: string
  quotes?: string
  can_post?: 0 | 1
  can_see_all_posts?: 0 | 1
  can_see_audio?: 0 | 1
  can_write_private_message?: 0 | 1
  can_send_friend_request?: 0 | 1
  is_favorite?: 0 | 1
  is_hidden_from_feed?: 0 | 1
  timezone?: number
  screen_name?: string
  maiden_name?: string
  crop_photo?: {
    photo: {
      id: number
      album_id: number
      owner_id: number
      sizes: Array<{
        type: string
        url: string
        width: number
        height: number
      }>
    }
    crop: {
      x: number
      y: number
      x2: number
      y2: number
    }
    rect: {
      x: number
      y: number
      x2: number
      y2: number
    }
  }
  friend_status?: number
  career?: Array<{
    group_id?: number
    company?: string
    country_id?: number
    city_id?: number
    city_name?: string
    from?: number
    until?: number
    position?: string
  }>
  military?: Array<{
    country_id: number
    unit: string
    unit_id: number
    from: number
    until: number
  }>
}

export interface UsersGetParams {
  user_ids?: string | number[]
  fields?: string[]
  name_case?: "nom" | "gen" | "dat" | "acc" | "ins" | "abl"
}

export interface UsersGetResponse extends VKBaseResponse<User[]> {}

export interface UsersSearchParams {
  q: string
  sort?: 0 | 1
  offset?: number
  count?: number
  fields?: string[]
  city?: number
  country?: number
  hometown?: string
  university_country?: number
  university?: number
  university_year?: number
  university_faculty?: number
  university_chair?: number
  sex?: 0 | 1 | 2
  status?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  age_from?: number
  age_to?: number
  birth_day?: number
  birth_month?: number
  birth_year?: number
  online?: 0 | 1
  has_photo?: 0 | 1
  school_country?: number
  school_city?: number
  school_class?: number
  school?: number
  school_year?: number
  religion?: string
  interests?: string
  company?: string
  position?: string
  group_id?: number
  from_list?: string[]
}

export interface UsersSearchResponse
  extends VKBaseResponse<{
    count: number
    items: User[]
  }> {}

export interface UsersGetSubscriptionsParams {
  user_id?: number
  extended?: 0 | 1
  offset?: number
  count?: number
  fields?: string[]
}

export interface UsersGetSubscriptionsResponse
  extends VKBaseResponse<{
    users: {
      count: number
      items: User[]
    }
    groups: {
      count: number
      items: Array<{
        id: number
        name: string
        screen_name: string
        is_closed: 0 | 1 | 2
        type: "group" | "page" | "event"
        photo_50: string
        photo_100: string
        photo_200: string
      }>
    }
  }> {}

export interface UsersGetFollowersParams {
  user_id?: number
  offset?: number
  count?: number
  fields?: string[]
  name_case?: "nom" | "gen" | "dat" | "acc" | "ins" | "abl"
}

export interface UsersGetFollowersResponse
  extends VKBaseResponse<{
    count: number
    items: User[]
  }> {}

export interface UsersReportParams {
  user_id: number
  type: "porn" | "spam" | "insult" | "advertisment"
  comment?: string
}

export interface UsersReportResponse extends VKBaseResponse<1> {}

export interface UsersIsAppUserParams {
  user_id?: number
}

export interface UsersIsAppUserResponse extends VKBaseResponse<0 | 1> {}

export interface UsersGetNearbyParams {
  latitude: number
  longitude: number
  accuracy?: number
  timeout?: number
  radius?: number
  fields?: string[]
  name_case?: "nom" | "gen" | "dat" | "acc" | "ins" | "abl"
  need_description?: boolean
}

export interface UsersGetNearbyResponse
  extends VKBaseResponse<{
    count: number
    items: Array<
      User & {
        distance: number
        description?: string
      }
    >
  }> {}

export interface AuthState {
  accessToken: string | null
  userId: number | null
  userInfo: SessionUserInfo | null
  loading: boolean
  error: string | null
  grantedPermissions: string[]

  loginWithVKID: () => Promise<void>
  handleOAuthCallback: (url: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  checkPermissions: () => Promise<boolean>
}
