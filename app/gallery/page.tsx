"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"
import ImageGrid from "@/components/image-grid"
import { getImages } from "@/utils/local-storage-utils"
import type { StoredImage } from "@/types/image"
import "../globals.css"
import { redirect } from "next/navigation"

export default function GalleryPage() {
  const [images, setImages] = useState<StoredImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sizeLocalstorage, setSizeLocalstorage] = useState({
    used: "0.00",
    total: "10.00",
    isNearLimit: false
  })
  const [localstorageLimit, setLocalstorageLimit] = useState<any>()

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

  const [loading, setLoading] = useState(false)
  const navigateTo = (path: string) => {
    setLoading(true)
    setTimeout(() => {
      redirect(path)
    }, 1000);
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
          <div className="mb-6 flex justify-between items-center">
            <div onClick={() => navigateTo('/')}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao inicio
              </Button>
            </div>

            <div onClick={() => navigateTo('/upload')}>
              <Button size="sm" className="gap-2 bg-indigo-500 hover:bg-indigo-500 button-up">
                <Upload className="h-4 w-4" />
                Carregar Imagens
              </Button>
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
  )
}
