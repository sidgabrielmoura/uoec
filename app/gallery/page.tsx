"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"
import ImageGrid from "@/components/image-grid"
import { getImages } from "@/utils/local-storage-utils"
import type { StoredImage } from "@/types/image"

export default function GalleryPage() {
  const [images, setImages] = useState<StoredImage[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Link href="/upload">
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload More
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-6">Image Gallery</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading images...</p>
          </div>
        ) : images.length > 0 ? (
          <ImageGrid images={images} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-500 mb-4">No images found</p>
            <Link href="/upload">
              <Button>Upload Images</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
