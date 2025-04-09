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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Create preview URLs for the accepted files
    const newPreviewFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))

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
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(newFiles[index].preview)
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
          <p className="text-lg font-medium">{isDragActive ? "Drop the images here" : "Drag & drop images here"}</p>
          <p className="text-sm text-gray-500">or click to select files</p>
        </div>
      </div>

      {previewFiles.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewFiles.map((previewFile, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={previewFile.preview || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="object-cover"
                    fill
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs mt-1 truncate">{previewFile.file.name}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading
                ? "Uploading..."
                : `Upload ${previewFiles.length} ${previewFiles.length === 1 ? "Image" : "Images"}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
