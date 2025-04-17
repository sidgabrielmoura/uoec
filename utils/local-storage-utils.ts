// import { v4 as uuidv4 } from "uuid"
// import type { StoredImage } from "@/types/image"
// import type { SharedLink } from "@/types/share"
// import { supabase } from "@/lib/supabase-client"

// const IMAGES_STORAGE_KEY = "meg-uploader-images"
// const SHARED_LINKS_STORAGE_KEY = "meg-uploader-shared-links"
// const DEFAULT_EXPIRATION_DAYS = 7

// const getLocalStorage = () => {
//   if (typeof window !== "undefined") {
//     return window.localStorage
//   }
//   return null
// }

// export const saveImage = async (file: File): Promise<{ success: boolean; error?: string }> => {
//   try {
//     const dataUrl = await fileToDataUrl(file)

//     const image: StoredImage = {
//       id: uuidv4(),
//       name: file.name,
//       size: file.size,
//       type: file.type,
//       storage_url: dataUrl,
//       uploadedAt: Date.now(),
//       categories: [],
//     }

//     const images = getImages()

//     const isDuplicate = images.some(
//       (existingImage) => existingImage.name === file.name && existingImage.size === file.size,
//     )

//     if (isDuplicate) {
//       return { success: false, error: `A imagem: ${file.name} já existe na sua galeria` }
//     }

//     images.push(image)

//     const localStorage = getLocalStorage()
//     if (localStorage) {
//       localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images))
//       return { success: true }
//     } else {
//       return { success: false, error: "Local storage is not available" }
//     }
//   } catch (error) {
//     console.error("Error saving image:", error)
//     return { success: false, error: "Não conseguimos salvar sua imagem" }
//   }
// }

// export const getImages = (): StoredImage[] => {
//   const localStorage = getLocalStorage()
//   if (!localStorage) return []

//   try {
//     const imagesJson = localStorage.getItem(IMAGES_STORAGE_KEY)
//     return imagesJson ? JSON.parse(imagesJson) : []
//   } catch (error) {
//     console.error("Error getting images:", error)
//     return []
//   }
// }

// export const getImageById = (id: string): StoredImage | null => {
//   const images = getImages()
//   return images.find((image) => image.id === id) || null
// }

// export const updateImage = (updatedImage: StoredImage): boolean => {
//   try {
//     const images = getImages()
//     const index = images.findIndex((image) => image.id === updatedImage.id)

//     if (index !== -1) {
//       images[index] = updatedImage
//       const localStorage = getLocalStorage()
//       if (localStorage) {
//         localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images))
//         return true
//       }
//     }

//     return false
//   } catch (error) {
//     console.error("Error updating image:", error)
//     return false
//   }
// }

// export const deleteImage = (id: string): boolean => {
//   try {
//     const images = getImages()
//     const filteredImages = images.filter((image) => image.id !== id)

//     const localStorage = getLocalStorage()
//     if (localStorage) {
//       localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(filteredImages))
//       return true
//     }

//     return false
//   } catch (error) {
//     console.error("Error deleting image:", error)
//     return false
//   }
// }

// // Shared link functions
// export const createSharedLink = async (images: StoredImage[]) => {
//   try {
//     const uuid = uuidv4()
//     const createdAt = new Date().toISOString()
//     const expiresAt = new Date(Date.now() + DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString()

//     const { data, error } = await supabase
//       .from("shared_links")
//       .insert([{ uuid, images, created_at: createdAt, expires_at: expiresAt }])
//       .select()

//     if (error) throw error

//     return data?.[0]
//   } catch (error) {
//     console.error("Erro ao criar link compartilhado:", error)
//     throw new Error("Falha ao criar link compartilhado")
//   }
// }

// export const getSharedLinks = async (): Promise<SharedLink[]> => {
//   try {
//     const { data, error } = await supabase
//       .from("shared_links")
//       .select("*")

//     if (error) throw error
//     return data || []
//   } catch (error) {
//     console.error("Erro ao buscar links compartilhados:", error)
//     return []
//   }
// }

// export async function getSharedLinkByUuid(uuid: string): Promise<{ success: boolean; data?: SharedLink; error?: any }> {
//   const { data, error } = await supabase
//     .from("shared_links")
//     .select("*")
//     .eq("uuid", uuid)
//     .single()

//   if (error) {
//     console.error("Erro ao buscar shared link:", error)
//     return { success: false, error }
//   }

//   return { success: true, data }
// }

// export const deleteSharedLink = async (uuid: string): Promise<boolean> => {
//   try {
//     const { error } = await supabase
//       .from("shared_links")
//       .delete()
//       .eq("uuid", uuid)

//     if (error) throw error
//     return true
//   } catch (error) {
//     console.error("Erro ao deletar link:", error)
//     return false
//   }
// }

// // Helper functions
// export const fileToDataUrl = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onload = () => resolve(reader.result as string)
//     reader.onerror = reject
//     reader.readAsDataURL(file)
//   })
// }
