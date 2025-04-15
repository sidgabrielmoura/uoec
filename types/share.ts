import type { StoredImage } from "./image"

export interface SharedLink {
  uuid: string
  images: StoredImage[]
  created_at: string
  expires_at: string
}
