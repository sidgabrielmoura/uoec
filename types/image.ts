export interface StoredImage {
  id: string
  name: string
  size: number
  type: string
  storage_url: string
  user_token: string
  created_at?: string
  divide_id?: string
  edited_at?: string


  categories?: string[]
  classified_at?: number
}
