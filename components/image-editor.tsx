"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Cropper from "react-easy-crop"
import NextImage from "next/image"
import * as SliderPrimitive from "@radix-ui/react-slider"
import type { Point, Area } from "react-easy-crop"
import { getCroppedImg } from "@/utils/crop-utils"
import type { StoredImage } from "@/types/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { CheckCircle, SaveAll, Undo2 } from "lucide-react"
import { saveImageToSupabase } from "@/utils/supabase"
import Link from "next/link"

interface ImageEditorProps {
  image: StoredImage
  onSave?: (editedImage: StoredImage) => void
}

export default function ImageEditor({ image, onSave }: ImageEditorProps) {
  const [columns, setColumns] = useState(2)
  const [isSaving, setIsSaving] = useState(false)
  const [imageParts, setImageParts] = useState<string[]>([])
  const [email, setEmail] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleColumnCrop = async () => {
    try {
      setIsSaving(true)

      const img = new window.Image()
      img.src = image.storage_url
      img.onload = async () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          console.error("Canvas context não encontrado")
          return
        }

        const partWidth = img.width / columns
        const partHeight = img.height

        const parts: string[] = []

        for (let i = 0; i < columns; i++) {
          canvas.width = partWidth
          canvas.height = partHeight

          ctx.clearRect(0, 0, partWidth, partHeight)
          ctx.drawImage(img, -i * partWidth, 0, img.width, img.height)

          const partDataUrl = canvas.toDataURL("image/png")
          parts.push(partDataUrl)
        }

        setImageParts(parts)
      }
    } catch (e) {
      console.error("Falha ao dividir a imagem:", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveImageCropped = async () => {
    setIsSaving(true)
    const files = imageParts.map((part, index) => {
      const byteString = atob(part.split(",")[1]);
      const mimeString = part.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new File([ab], `part-${index + 1}.png`, { type: mimeString });
    });

    for (const file of files) {
      await saveImageToSupabase(file, email || "");
      setSuccess("Imagem Dividida com sucesso!")
      setTimeout(() => {
        setIsSaving(false)
      }, 1000);
    }
  }

  const handleColumnsChange = (value: string) => {
    setColumns(Number.parseInt(value))
  }

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  const columnOptions = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <main className="flex flex-col items-center p-4">
      <div className="w-full mb-6">
        <Select value={columns.toString()} onValueChange={handleColumnsChange}>
          <SelectTrigger id="columns-select" className="w-full border-indigo-500 bg-indigo-500">
            <SelectValue placeholder="Select number of columns" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-600">
            {columnOptions.map((option) => (
              <SelectItem key={option} value={option.toString()} className="hover:bg-indigo-600 w-full">
                {option} {option === 1 ? "coluna" : "colunas"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-full">
        {imageParts.length === 0 ? (
          <NextImage
            src={image.storage_url || "/placeholder.svg"}
            alt="Imagem original"
            width={800}
            height={600}
            className="w-full h-auto"
            priority
          />
        ) : (
          <>
            {imageParts.length > 0 && (
              <div className="flex gap-4 w-full justify-center flex-1">
                {imageParts.map((part, index) => (
                  <div key={index} className="border border-gray-300 rounded-md overflow-hidden">
                    <img src={part} alt={`Parte ${index + 1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          A foto será dividida em {columns} {columns === 1 ? "coluna igual" : "colunas iguais"}
        </p>
      </div>

      <div className="flex gap-1 w-full">
        <Button
          variant="default"
          className="mt-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 w-full"
          onClick={handleColumnCrop}
          disabled={isSaving}
        >
          Dividir Imagem
        </Button>

        <Button
          className="group relative mt-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl cursor-pointer"
          onClick={() => setImageParts([])}
          disabled={isSaving}
        >
          <Undo2 className="size-5"/>
          <span className="absolute -top-14 left-[50%] -translate-x-[50%]
          z-20 origin-left scale-0 px-3 border border-zinc-600 py-2 text-sm font-bold
          shadow-md transition-all duration-300 ease-in-out 
          group-hover:scale-100 rounded-full bg-indigo-500 hover:bg-indigo-600">
            Desfazer
          </span>
        </Button>

        <Button
          className="group relative mt-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl cursor-pointer"
          onClick={handleSaveImageCropped}
          disabled={isSaving}
        >
          <SaveAll className="size-5"/>
          <span className="absolute -top-14 left-[50%] -translate-x-[50%]
          z-20 origin-left scale-0 px-3 border border-zinc-600 py-2 text-sm font-bold
          shadow-md transition-all duration-300 ease-in-out text-nowrap
          group-hover:scale-100 rounded-full bg-indigo-500 hover:bg-indigo-600">
            Salvar na galeria
          </span>
        </Button>
      </div>

      {success && (
        <div className="mt-6 p-4 border border-green-500 bg-green-950 text-green-400 rounded-lg shadow-sm w-full flex flex-col items-center">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
          <div className="mt-3">
            <Link href="/gallery">
              <Button variant="secondary" size="sm">
                Ver na galeria
              </Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
