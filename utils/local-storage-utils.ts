import { v4 as uuidv4 } from "uuid"
import type { StoredImage } from "@/types/image"
import type { SharedLink } from "@/types/share"

// Constants
const IMAGES_STORAGE_KEY = "meg-uploader-images"
const SHARED_LINKS_STORAGE_KEY = "meg-uploader-shared-links"
const DEFAULT_EXPIRATION_DAYS = 7

// Helper function to get localStorage (with SSR safety)
const getLocalStorage = () => {
  if (typeof window !== "undefined") {
    return window.localStorage
  }
  return null
}

// Image functions
export const saveImage = async (file: File): Promise<{ success: boolean; error?: string }> => {
  try {
    // Convert file to base64
    const dataUrl = await fileToDataUrl(file)

    // Create image object
    const image: StoredImage = {
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl,
      uploadedAt: Date.now(),
      categories: [], // Will be populated by AI classification later
    }

    // Get existing images
    const images = getImages()

    // Check for duplicates (by name and content)
    const isDuplicate = images.some(
      (existingImage) => existingImage.name === file.name && existingImage.size === file.size,
    )

    if (isDuplicate) {
      return { success: false, error: "This image already exists in your gallery" }
    }

    // Add new image
    images.push(image)

    // Save to localStorage
    const localStorage = getLocalStorage()
    if (localStorage) {
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images))
      return { success: true }
    } else {
      return { success: false, error: "Local storage is not available" }
    }
  } catch (error) {
    console.error("Error saving image:", error)
    return { success: false, error: "Failed to save image" }
  }
}

export const getImages = (): StoredImage[] => {
  const localStorage = getLocalStorage()
  if (!localStorage) return []

  try {
    const imagesJson = localStorage.getItem(IMAGES_STORAGE_KEY)
    return imagesJson ? JSON.parse(imagesJson) : []
  } catch (error) {
    console.error("Error getting images:", error)
    return []
  }
}

export const getImageById = (id: string): StoredImage | null => {
  const images = getImages()
  return images.find((image) => image.id === id) || null
}

export const updateImage = (updatedImage: StoredImage): boolean => {
  try {
    const images = getImages()
    const index = images.findIndex((image) => image.id === updatedImage.id)

    if (index !== -1) {
      images[index] = updatedImage
      const localStorage = getLocalStorage()
      if (localStorage) {
        localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images))
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Error updating image:", error)
    return false
  }
}

export const deleteImage = (id: string): boolean => {
  try {
    const images = getImages()
    const filteredImages = images.filter((image) => image.id !== id)

    const localStorage = getLocalStorage()
    if (localStorage) {
      localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(filteredImages))
      return true
    }

    return false
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}

// Shared link functions
export const createSharedLink = (images: StoredImage[]): SharedLink => {
  try {
    const uuid = uuidv4()
    const createdAt = Date.now()
    const expiresAt = createdAt + DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000 // 7 days

    const sharedLink: SharedLink = {
      uuid,
      images,
      createdAt,
      expiresAt,
    }

    const sharedLinks = getSharedLinks()
    sharedLinks.push(sharedLink)

    const localStorage = getLocalStorage()
    if (localStorage) {
      localStorage.setItem(SHARED_LINKS_STORAGE_KEY, JSON.stringify(sharedLinks))
    }

    return sharedLink
  } catch (error) {
    console.error("Error creating shared link:", error)
    throw new Error("Failed to create shared link")
  }
}

export const getSharedLinks = (): SharedLink[] => {
  const localStorage = getLocalStorage()
  if (!localStorage) return []

  try {
    const linksJson = localStorage.getItem(SHARED_LINKS_STORAGE_KEY)
    const links = linksJson ? JSON.parse(linksJson) : []

    // Filter out expired links
    const now = Date.now()
    return links.filter((link: SharedLink) => link.expiresAt > now)
  } catch (error) {
    console.error("Error getting shared links:", error)
    return []
  }
}

export const getSharedLinkByUuid = (uuid: string): SharedLink | null => {
  const links = getSharedLinks()
  return links.find((link) => link.uuid === uuid) || null
}

export const deleteSharedLink = (uuid: string): boolean => {
  try {
    const links = getSharedLinks()
    const filteredLinks = links.filter((link) => link.uuid !== uuid)

    const localStorage = getLocalStorage()
    if (localStorage) {
      localStorage.setItem(SHARED_LINKS_STORAGE_KEY, JSON.stringify(filteredLinks))
      return true
    }

    return false
  } catch (error) {
    console.error("Error deleting shared link:", error)
    return false
  }
}

// Helper functions
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
