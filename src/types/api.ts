export interface VKBaseResponse<T> {
  response: T
}

export interface VKError {
  error_code: number
  error_msg: string
  request_params: Array<{
    key: string
    value: string
  }>
}
