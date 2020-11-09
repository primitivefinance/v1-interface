export interface ErrorContextValues {
  error: boolean
  msg: string
  link: string
  throwError: (msg: string, link?: string) => void
  clearError: () => void
}
