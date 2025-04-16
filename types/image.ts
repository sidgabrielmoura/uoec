export interface StoredImage {
  id: string
  name: string
  size: number
  type: string
  storage_url: string
  user_token: string
  uploadedAt: number
  created_at?: string
  classified_at?: number
  edited_at?: string
  categories?: string[]
}
