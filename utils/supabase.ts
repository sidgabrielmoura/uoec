import { supabase } from "@/lib/supabase-client";
import { fileToDataUrl } from "./local-storage-utils";

export async function saveImageToSupabase(file: File, email: string): Promise<{ success: boolean; error?: any; data?: any }> {
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
    }])
    .select()

  if (error) {
    console.error("Erro ao salvar imagem:", error)
    return { success: false, error }
  }

  return { success: true, data }
}

export async function getImagesFromSupabase(): Promise<{ success: boolean; error?: any; data?: any }> {
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

export function logout(){
  localStorage.removeItem('userEmail')
}