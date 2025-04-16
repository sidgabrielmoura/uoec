"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Crop, Share2, Download, MoreVertical, Trash2 } from "lucide-react"
import ShareLinkModal from "@/components/share-link-modal"
import type { StoredImage } from "@/types/image"
import { motion, AnimatePresence } from "framer-motion"
import { createSharedLink } from "@/utils/supabase"

interface ImageGridProps {
  images: StoredImage[]
  isSharedView?: boolean
  onDownload?: (image: StoredImage) => void
  onDelete?: (id: string) => void
}

export default function ImageGrid({ images, isSharedView = false, onDownload, onDelete }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [showImg, setShowImg] = useState({ img: "", status: false })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (img: string) => {
    timeoutRef.current = setTimeout(() => {
      setShowImg({ img, status: true })
    }, 700)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const closeModal = () => {
    setShowImg({ img: "", status: false })
  }

  const handleDelete = async (id: string) => {
    if(onDelete){
      onDelete(id)
    }else{
      console.log('deu erro meu chapa, te vira')
    }
  }

  const handleShare = async (image: StoredImage) => {
    setSelectedImage(image)
  
    try {
      const link = await createSharedLink([image])
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
      link.href = image.storage_url
      link.download = image.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
  }

  function formatDate(dateString: string | undefined): string {
    const date = new Date(dateString || "")
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
  
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {showImg.status && (
            <motion.div
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-[90vw] max-w-4xl h-[80vh] rounded-2xl overflow-hidden shadow-lg"
              >
                <Image
                  src={showImg.img || "/placeholder.svg"}
                  alt="Imagem grande"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {images.map((image) => (
          <Card
            key={image.id}
            className="overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl hover:scale-[1.02] transition-transform duration-300 ease-in-out flex flex-col justify-center items-center"
          >
            <div className="w-[200px] h-5 bg-indigo-500/70 absolute z-[999] top-1 rounded-full" />
            <div className="aspect-square w-full relative"
              onMouseEnter={() => handleMouseEnter(image.storage_url)}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={image.storage_url || "/placeholder.svg"}
                alt={image.name}
                fill
                className={`object-cover`}
              />
            </div>

            <CardContent className="p-4 relative w-full flex flex-col items-start">
              <div className="space-y-1 w-full">
                <p className="font-medium text-white truncate" title={image.name}>
                  {image.name}
                </p>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatFileSize(image.size)}</span>
                  <span>{formatDate(image.created_at)}</span>
                </div>

                {image.categories && image.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.categories.map((category, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white/10 text-white/80 rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-4 w-full pt-0 flex justify-between items-center">
              {isSharedView ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-white/10 border-zinc-600 hover:border-zinc-500 transition"
                  onClick={() => handleDownload(image)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              ) : (
                <>
                  <div className="flex space-x-2">
                    <Link href={`/editor/${image.id}`}>
                      <Button variant="outline" size="icon" className="hover:bg-white/10 transition border-zinc-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare(image)}
                      className="hover:bg-white/10 transition border-zinc-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-white/5 transition">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                      <DropdownMenuItem onClick={() => handleDownload(image)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(image.id)} className="text-red-500">
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
        {isSharedView && (
          <a href="/gallery" className="containerCard noselect">
            <div className="canvas">
              <div className="tracker tr-1"></div>
              <div className="tracker tr-2"></div>
              <div className="tracker tr-3"></div>
              <div className="tracker tr-4"></div>
              <div className="tracker tr-5"></div>
              <div className="tracker tr-6"></div>
              <div className="tracker tr-7"></div>
              <div className="tracker tr-8"></div>
              <div className="tracker tr-9"></div>
              <div id="card">
                <div className="card-content">
                  <div className="card-glare"></div>
                  <div className="cyber-lines">
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <p id="prompt">Faça upload também</p>
                  <div className="title">IR PARA<br />GALERIA</div>
                  <div className="glowing-elements">
                    <div className="glow-1"></div>
                    <div className="glow-2"></div>
                    <div className="glow-3"></div>
                  </div>
                  <div className="card-particles">
                    <span></span><span></span><span></span> <span></span><span></span
                    ><span></span>
                  </div>
                  <div className="corner-elements">
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <div className="scan-line"></div>
                </div>
              </div>
            </div>
          </a>
        )}
      </div>

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareLink={shareLink}
      />

    </>
  )
}
