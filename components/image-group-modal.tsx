"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { StoredImage } from "@/types/image"
import { Download } from "lucide-react"
import JSZip from "jszip"
import saveAs from "file-saver"

interface GroupImagesModalProps {
  isOpen: boolean
  onClose: () => void
  images: StoredImage[]
}

export default function GroupImagesModal({ isOpen, onClose, images }: GroupImagesModalProps) {

function formatDate(dateString: string | undefined): string {
    const date = new Date(dateString || "")
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
}

    const downloadImagesAsZip = async (images: StoredImage[]) => {
        if(images.length === 1){
        const link = document.createElement("a")
        link.href = images[0].storage_url
        link.download = images[0].name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        }

        const zip = new JSZip()

        images.forEach((image) => {
        const base64 = image.storage_url.split(",")[1]
        zip.file(image.name, base64, {base64: true})
        })

        const content = await zip.generateAsync({ type: "blob" })
        saveAs(content, "U.O.E.C_images.zip")
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B"
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
        else return (bytes / 1048576).toFixed(2) + " MB"
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full overflow-y-auto max-h-[80vh] sm:w-[40vw] sm:min-w-[40vw] bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-xl shadow-lg z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {images[0]?.name} e {images.length - 1} {images.length > 2 ? "outras imagens" : "outra imagem"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex gap-2">
            {images.map((image, index) => (
              <div key={index} className="w-full h-[300px] rounded-lg shadow-md overflow-hidden hover:scale-y-105 transition-all duration-200 ease-in-out">
                <img
                  src={image.storage_url}
                  alt={image.name}
                  className="object-cover w-full h-full rounded-lg border-2 border-zinc-400"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:mt-4 !justify-between !w-full max-sm:flex-col">
            <div className="flex sm:flex-col gap-2 justify-between sm:justify-center text-zinc-400">
                <span className="text-sm">
                    Peso total: {formatFileSize(images.reduce((acc, image) => acc + image.size, 0))}
                </span>
                <span className="text-sm">
                    {formatDate(images[0]?.created_at)}
                </span>
            </div>
            <div className="flex gap-2 items-center max-sm:mt-2">
                <Button type="button" variant="ghost" onClick={() => downloadImagesAsZip(images)} className="button-up max-sm:w-full bg-indigo-500 hover:bg-indigo-500">
                    <Download/>
                    baixar tudo
                </Button>
                <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-50 bg-indigo-500 hover:bg-indigo-500">
                    Fechar
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
