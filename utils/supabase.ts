import { supabase } from "@/lib/supabase-client";
import { StoredImage } from "@/types/image";
import { SharedLink } from "@/types/share";
import { v4 as uuidv4 } from "uuid"

export async function saveImageToSupabase(file: File, email: string, uuid?: string, highQuality?: boolean): Promise<{ success: boolean; error?: any; data?: any }> {
  if (!email) {
    console.error("email não encontrado")
  }

  const dataUrl = await fileToDataUrl(file)
  const { data, error } = await supabase
    .from("imagens")
    .insert([{
      name: file.name,
      size: file.size,
      storage_url: dataUrl,
      created_at: new Date().toISOString(),
      user_token: email,
      divide_id: uuid,
      high_quality: highQuality ?? false
    }])
    .select()

  if (error) {
    console.error("Erro ao salvar imagem:", error)
    return { success: false, error }
  }

  return { success: true, data }
}

export async function getImagesFromSupabase(): Promise<{ success: boolean; error?: any; data?: any }> {
  if (typeof window === "undefined") {
    console.error("localStorage não disponível no servidor")
    return { success: false, error: "localStorage não disponível" }
  }

  const token = localStorage.getItem('userEmail')
  if (!token) {
    console.error("Token não encontrado no localStorage")
    return { success: false, error: "Token não encontrado" }
  }

  const { data, error } = await supabase
    .from("imagens")
    .select("*")
    .eq("user_token", token)

  if (error) {
    console.error("Erro ao buscar imagens:", error)
    return { success: false, error }
  }

  return { success: true, data }
}

export const getImageByIdFromSupabase = async (id: string): Promise<StoredImage | null> => {
  const { success, data, error } = await getImagesFromSupabase();
  if (!success || !data) {
    console.error("Erro ao buscar imagens:", error);
    return null;
  }
  console.log("Dados recebidos:", data);
  return data.find((image: StoredImage) => image.id === id) || null;
}

export async function updateImageInSupabase(image: StoredImage): Promise<{ success: boolean; error?: any }> {
  const { data, error } = await supabase
    .from("imagens")
    .update({
      name: image.name,
      size: image.size,
      storage_url: image.storage_url,
      edited_at: new Date().toISOString(),
      user_token: image.user_token,
    })
    .eq("id", image.id)
    .select()
  if (error) {
    console.error("Erro ao atualizar imagem:", error)
    return { success: false, error }
  }
  console.log("Imagem atualizada com sucesso:", data)
  return { success: true }
}

export async function deleteImageFromSupabase(id: string): Promise<{ success: boolean; error?: any }> {
  const { data, error } = await supabase
    .from("imagens")
    .delete()
    .eq("id", id)
    .select()

  if (error) {
    console.error("Erro ao deletar imagem:", error)
    return { success: false, error }
  }

  console.log("Imagem deletada com sucesso:")
  return { success: true }
}

export async function clearSupabaseImages(): Promise<{ success: boolean; error?: any }> {
  const token = localStorage.getItem('userEmail')
  if (!token) {
    console.error("Token não encontrado no localStorage")
    return { success: false, error: "Token não encontrado" }
  }
  const { data, error } = await supabase
    .from("imagens")
    .delete()
    .eq("user_token", token)

  if (error) {
    console.error("Erro ao limpar imagens:", error)
    return { success: false, error }
  }

  console.log("Imagens limpas com sucesso:")
  return { success: true }
}

const DEFAULT_EXPIRATION_DAYS = 7

export const createSharedLink = async (images: StoredImage[]) => {
  try {
    const uuid = uuidv4()
    const createdAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from("shared_links")
      .insert([{ uuid, images, created_at: createdAt, expires_at: expiresAt }])
      .select()

    if (error) throw error

    return data?.[0]
  } catch (error) {
    console.error("Erro ao criar link compartilhado:", error)
    throw new Error("Falha ao criar link compartilhado")
  }
}

export const getSharedLinks = async (): Promise<SharedLink[]> => {
  try {
    const { data, error } = await supabase
      .from("shared_links")
      .select("*")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Erro ao buscar links compartilhados:", error)
    return []
  }
}

export async function deleteSharedLink(uuid: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("shared_links")
      .delete()
      .eq("uuid", uuid)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Erro ao deletar link:", error)
    return false
  }
}

export async function getSharedLinkByUuid(uuid: string): Promise<{ success: boolean; data?: SharedLink; error?: any }> {
  const { data, error } = await supabase
    .from("shared_links")
    .select("*")
    .eq("uuid", uuid)
    .single()

  if (error) {
    console.error("Erro ao buscar shared link:", error)
    return { success: false, error }
  }

  return { success: true, data }
}

export function logout(){
  localStorage.removeItem('userEmail')
}

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}