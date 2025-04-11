"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, Upload } from "lucide-react"
import ImageGrid from "@/components/image-grid"
import { createSharedLink, getImages } from "@/utils/local-storage-utils"
import type { StoredImage } from "@/types/image"
import "../globals.css"
import { redirect } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ShareLinkModal from "@/components/share-link-modal"

export default function GalleryPage() {
  const [images, setImages] = useState<StoredImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sizeLocalstorage, setSizeLocalstorage] = useState({
    used: "0.00",
    total: "10.00",
    isNearLimit: false
  })
  const [selectedImage, setSelectedImage] = useState<StoredImage[] | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    const loadImages = () => {
      try {
        const storedImages = getImages()
        setImages(storedImages)
      } catch (error) {
        console.error("Failed to load images:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
    getLocalStorageUsage()
  }, [])

  function getLocalStorageUsage() {
    let total = 0
  
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key)
        total += key.length + (value?.length || 0)
      }
    }
  
    const usedMB = ((total * 2) / 1024) / 1000
    const totalMB = 10
    const remainingMB = totalMB - usedMB
    const isNearLimit = remainingMB < 1
  
    setSizeLocalstorage({
      used: usedMB.toFixed(2),
      total: totalMB.toFixed(2),
      isNearLimit
    })
  }

  const handleShare = (image: StoredImage[]) => {
    setSelectedImage(image)

    try {
      const link = createSharedLink([...image])
      const fullUrl = `${window.location.origin}/share/${link.uuid}`
      setShareLink(fullUrl)
      setIsShareModalOpen(true)
    } catch (error) {
      console.error("Failed to create shared link:", error)
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
            <div className="mb-6 flex justify-between items-center">
              <div onClick={() => navigateTo('/')}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao inicio
                </Button>
              </div>

              <div className="flex gap-2 items-center">
                <div onClick={() => navigateTo('/upload')}>
                  <Button size="sm" className="gap-2 bg-zinc-700 hover:bg-zinc-700">
                    <Upload className="h-4 w-4" />
                    Carregar Imagens
                  </Button>
                </div>

                <div className="tooltip-container" onClick={() => handleShare([...images])}>
                  <div className="button-content">
                    <span className="text">Share</span>
                    <svg
                      className="share-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path
                        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-col -space-y-6 mb-8">
                <h1 className="text-3xl font-bold mb-6">Galeria de imagens</h1>
                <h1 className="ml-1 text-zinc-400">
                  espaço usado:{" "}
                  <span className={sizeLocalstorage.isNearLimit ? "text-red-500 font-semibold" : ""}>
                    {sizeLocalstorage.used} MB / {sizeLocalstorage.total} MB
                  </span>
                </h1>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Carregando imagens...</p>
                </div>
              ) : images.length > 0 ? (
                <ImageGrid images={images} />
              ) : (
                <div className="flex flex-col mt-52 space-y-4 items-center justify-center h-64 text-center">
                  <div className="w-full flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-zinc-600 animate-pulse w-full h-[500px] rounded-2xl"/>
                    ))}
                  </div>
                  <div onClick={() => navigateTo('/upload')}>
                    <Button className="bg-indigo-500 hover:bg-indigo-500 button-up">Carregar imagens</Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareLink={shareLink}
      />
    </>
  )
}
