"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  onUpload: (files: File[]) => void
  isUploading: boolean
}

export default function ImageUploader({ onUpload, isUploading }: ImageUploaderProps) {
  const [previewFiles, setPreviewFiles] = useState<{ file: File; preview: string }[]>([])

  // 👉 Função de redimensionamento e compressão
  const resizeImage = (file: File, maxSize = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const img = new window.Image()
        img.src = event.target?.result as string

        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
          resolve(dataUrl)
        }

        img.onerror = (e: any) => reject(e)
      }

      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
  }

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
  
    return new File([u8arr], filename, { type: mime })
  }

  // 👇 Redimensiona ao dropar
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newPreviewFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const preview = await resizeImage(file)
        const compressedFile = dataURLtoFile(preview, file.name)
        return { file: compressedFile, preview }
      })
    )
  
    setPreviewFiles((prev) => [...prev, ...newPreviewFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  })

  const removeFile = (index: number) => {
    setPreviewFiles((prev) => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleUpload = () => {
    if (previewFiles.length > 0) {
      onUpload(previewFiles.map((pf) => pf.file))
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="text-lg font-medium">{isDragActive ? "Solte a imagem aqui" : "Arraste e solte imagens aqui"}</p>
          <p className="text-sm text-gray-500">ou clique para selecionar nos arquivos</p>
        </div>
      </div>

      {previewFiles.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewFiles.map((previewFile, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={previewFile.preview || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="object-cover rounded-2xl"
                    fill
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-black" />
                </button>
                <p className="text-xs mt-1 truncate">{previewFile.file.name}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={isUploading} className="bg-indigo-500 hover:bg-indigo-500">
              {isUploading
                ? "Uploading..."
                : `Upload ${previewFiles.length} ${previewFiles.length === 1 ? "Imagem" : "Imagens"}`}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-600 animate-pulse w-full h-[150px] rounded-2xl" />
          ))}
        </div>
      )}
    </div>
  )
}
