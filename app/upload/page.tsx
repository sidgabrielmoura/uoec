"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ImageUploader from "@/components/image-uploader"
import { saveImage } from "@/utils/local-storage-utils"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageUpload = async (files: File[]) => {
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      let successCount = 0

      for (const file of files) {
        const result = await saveImage(file)
        if (result.success) {
          successCount++
        } else {
          setUploadError(result.error || "Failed to upload image")
          break
        }
      }

      if (successCount > 0) {
        setUploadSuccess(`Successfully uploaded ${successCount} ${successCount === 1 ? "image" : "images"}`)
      }
    } catch (error) {
      setUploadError("An error occurred during upload")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Carregar imagens</h1>

        <ImageUploader onUpload={handleImageUpload} isUploading={isUploading} />

        {uploadSuccess && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
            {uploadSuccess}
            <div className="mt-2">
              <Link href="/gallery">
                <Button variant="outline" size="sm">
                  View in Gallery
                </Button>
              </Link>
            </div>
          </div>
        )}

        {uploadError && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">{uploadError}</div>}
      </div>
    </main>
  )
}
