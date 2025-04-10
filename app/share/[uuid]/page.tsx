"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import { getSharedLinkByUuid } from "@/utils/local-storage-utils"
import type { StoredImage } from "@/types/image"
import type { SharedLink } from "@/types/share"
import ImageGrid from "@/components/image-grid"
import { redirect, useParams } from "next/navigation"

export default function SharedLinkPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const [sharedLink, setSharedLink] = useState<SharedLink | null>(null)
  const [images, setImages] = useState<StoredImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigateTo = (path: string) => {
    setLoading(true)
    setTimeout(() => {
      redirect(path)
    }, 1000);
  }

  useEffect(() => {
    const loadSharedLink = () => {
      try {
        const link = getSharedLinkByUuid(uuid)
        if (link) {
          setSharedLink(link)
          setImages(link.images)
        } else {
          setError("Shared link not found or has expired")
        }
      } catch (e) {
        setError("Failed to load shared link")
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    loadSharedLink()
  }, [uuid])

  const downloadImage = (image: StoredImage) => {
    const link = document.createElement("a")
    link.href = image.dataUrl
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error || !sharedLink) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 text-red-700 rounded-md">{error || "Shared link not found"}</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
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
          <div className="mb-6">
            <div onClick={() => navigateTo('/')}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao início
              </Button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-6">Imagens Compartilhadas</h1>

            {images.length > 0 ? (
              <div>
                <div className="mb-4">
                  <Button variant="default" size="sm" className="gap-2 bg-indigo-500 hover:bg-indigo-500" onClick={() => images.forEach(downloadImage)}>
                    <Download className="h-4 w-4" />
                    Download All
                  </Button>
                </div>
                <ImageGrid images={images} isSharedView={true} onDownload={downloadImage} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500">Não há imagens encontradas para esse link</p>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  )
}
