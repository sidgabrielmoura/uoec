"use client"

import { useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import ImageEditor from "@/components/image-editor"
import type { StoredImage } from "@/types/image"
import { getImageByIdFromSupabase, updateImageInSupabase } from "@/utils/supabase"

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [image, setImage] = useState<StoredImage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
  
    const loadImage = async () => {
      try {
        const foundImage: any = await getImageByIdFromSupabase(id)
        if (foundImage) {
          setImage(foundImage)
        } else {
          setError("Image not found")
        }
      } catch (e) {
        setError("Failed to load image")
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
  
    loadImage()
  }, [id])

  const handleSave = async (editedImage: StoredImage) => {
    try {
      await updateImageInSupabase(editedImage)
      router.push("/gallery")
    } catch (e) {
      console.error("falha ao salvar imagem editada:", e)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Carregando...</div>
  }

  if (error || !image) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/gallery">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Button>
          </Link>
        </div>
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error || "imagem não encontrada"}</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/gallery">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar à galeria
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Editar imagem</h1>
        <ImageEditor image={image} />
      </div>

      {success && (
        <div className="mt-6 p-4 border border-green-500 bg-green-950 text-green-400 rounded-lg shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
          <div className="mt-3">
            <Link href="/gallery">
              <Button variant="secondary" size="sm">
                Ver na galeria
              </Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
