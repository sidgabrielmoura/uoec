"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Crop, Share2, Download, MoreVertical, Trash2 } from "lucide-react"
import { deleteImage, createSharedLink } from "@/utils/local-storage-utils"
import ShareLinkModal from "@/components/share-link-modal"
import type { StoredImage } from "@/types/image"

interface ImageGridProps {
  images: StoredImage[]
  isSharedView?: boolean
  onDownload?: (image: StoredImage) => void
}

export default function ImageGrid({ images, isSharedView = false, onDownload }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImage(id)
      // Force a page reload to refresh the image list
      window.location.reload()
    }
  }

  const handleShare = (image: StoredImage) => {
    setSelectedImage(image)

    try {
      const link = createSharedLink([image])
      const fullUrl = `${window.location.origin}/share/${link.uuid}`
      setShareLink(fullUrl)
      setIsShareModalOpen(true)
    } catch (error) {
      console.error("Failed to create shared link:", error)
    }
  }

  const handleDownload = (image: StoredImage) => {
    if (onDownload) {
      onDownload(image)
    } else {
      const link = document.createElement("a")
      link.href = image.dataUrl
      link.download = image.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <Image src={image.dataUrl || "/placeholder.svg"} alt={image.name} fill className="object-cover" />
            </div>

            <CardContent className="p-3">
              <div className="space-y-1">
                <p className="font-medium truncate" title={image.name}>
                  {image.name}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatFileSize(image.size)}</span>
                  <span>{formatDate(image.uploadedAt)}</span>
                </div>
                {image.categories && image.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.categories.map((category, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-3 pt-0 flex justify-between">
              {isSharedView ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload(image)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              ) : (
                <>
                  <div className="flex space-x-1">
                    <Link href={`/editor/${image.id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/editor/${image.id}?mode=crop`}>
                      <Button variant="outline" size="icon">
                        <Crop className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" onClick={() => handleShare(image)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(image)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(image.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <ShareLinkModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} shareLink={shareLink} />
    </>
  )
}
