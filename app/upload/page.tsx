"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, CheckCircle, Image } from "lucide-react"
import ImageUploader from "@/components/image-uploader"
import { saveImage } from "@/utils/local-storage-utils"
import { redirect } from "next/navigation"
import { saveImageToSupabase } from "@/utils/supabase"
import LoginModal from "@/components/login-modal"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [findEmail, setFindEmail] = useState(false)

  const handleImageUpload = async (filesOrEvent: File[] | Event) => {
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)
  
    try {
      let files: File[] = []
  
      if (filesOrEvent instanceof Event) {
        filesOrEvent.preventDefault()
        const input = (filesOrEvent.target as HTMLInputElement)
        if (input?.files) {
          files = Array.from(input.files)
        }
      } else if (Array.isArray(filesOrEvent)) {
        files = filesOrEvent
      } else {
        throw new Error("Parâmetro inválido recebido em handleImageUpload")
      }
  
      if (files.length === 0) {
        setUploadError("Nenhum arquivo selecionado")
        return
      }
  
      const maxFiles = 4
      if (files.length > maxFiles) {
        setUploadError(`Você pode enviar no máximo ${maxFiles} arquivos por vez`)
        return
      }
  
      let successCount = 0
  
      for (const file of files) {
        const email = localStorage.getItem('userEmail')
        if (!email) {
          setUploadError("Email não encontrado")
          setFindEmail(true)
          return
        }
  
        const result = await saveImageToSupabase(file, email)
        if (result.success) {
          successCount++
        } else {
          setUploadError(result.error || "Falha ao carregar imagem")
          break
        }
      }
  
      if (successCount > 0) {
        setUploadSuccess(`Upload realizado com sucesso: ${successCount} ${successCount === 1 ? "imagem" : "imagens"}`)
      }
    } catch (error) {
      setUploadError("Ocorreu um erro durante o upload")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const [loading, setLoading] = useState(false)
  const navigateTo = (path: string) => {
    setLoading(true)
    setTimeout(() => {
      redirect(path)
    }, 1000);
  }

  return (
    <>
      <main className="container mx-auto px-6 py-12 text-white">
        {loading ? (
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="honeycomb">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <div onClick={() => navigateTo('/')}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o início
                </Button>
              </div>
            </div>

            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                Envie suas imagens
              </h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Arraste e solte ou clique no campo abaixo para enviar suas imagens.
              </p>

              <ImageUploader onUpload={handleImageUpload} isUploading={isUploading} />

              {uploadSuccess && (
                <div className="mt-6 p-4 border border-green-500 bg-green-950 text-green-400 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>{uploadSuccess}</span>
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

              {uploadError && (
                <div className="mt-6 p-4 border border-red-500 bg-red-950 text-red-400 rounded-lg shadow-sm">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{uploadError}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <LoginModal
        isOpen={findEmail}
        onClose={() => setFindEmail(false)}
      />
    </>
  )
}
