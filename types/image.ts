export interface StoredImage {
  id: string
  name: string
  size: number
  type: string
  dataUrl: string
  uploadedAt: number
  editedAt?: number
  classifiedAt?: number
  categories?: string[]
}
