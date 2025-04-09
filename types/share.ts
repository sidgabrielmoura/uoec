import type { StoredImage } from "./image"

export interface SharedLink {
  uuid: string
  images: StoredImage[]
  createdAt: number
  expiresAt: number
}
