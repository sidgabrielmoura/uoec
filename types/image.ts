export interface StoredImage {
  id: string
  name: string
  size: number
  type: string
  storage_url: string
  uploadedAt: number
  created_at?: string
  classifiedAt?: number
  categories?: string[]
}
