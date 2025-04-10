"use client"

import { useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Cropper from "react-easy-crop"
import * as SliderPrimitive from "@radix-ui/react-slider"
import type { Point, Area } from "react-easy-crop"
import { getCroppedImg } from "@/utils/crop-utils"
import type { StoredImage } from "@/types/image"

interface ImageEditorProps {
  image: StoredImage
  onSave: (editedImage: StoredImage) => void
}

export default function ImageEditor({ image, onSave }: ImageEditorProps) {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get("mode") === "crop" ? "crop" : "edit"

  const [mode, setMode] = useState<any>(initialMode)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [columns, setColumns] = useState(2)
  const [isSaving, setIsSaving] = useState(false)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    try {
      setIsSaving(true)

      const croppedImage = await getCroppedImg(image.dataUrl, croppedAreaPixels, rotation)

      if (croppedImage) {
        const editedImage: StoredImage = {
          ...image,
          dataUrl: croppedImage,
          editedAt: Date.now(),
        }

        onSave(editedImage)
      }
    } catch (e) {
      console.error("Failed to crop image:", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleColumnCrop = async () => {
    try {
      setIsSaving(true)
      const editedImage: StoredImage = {
        ...image,
        editedAt: Date.now(),
      }

      onSave(editedImage)
    } catch (e) {
      console.error("Failed to crop image by columns:", e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <TabsList className="grid grid-cols-2 gap-2">
          <TabsTrigger value="edit" className={mode === "edit" ? "!bg-indigo-500 text-white rounded-lg" : "text-gray-50 rounded-lg"}>Edição Básica</TabsTrigger>
          <TabsTrigger value="crop" className={mode === "crop" ? "!bg-indigo-500 text-white rounded-lg" : "text-gray-50 rounded-lg"}>Recorte</TabsTrigger>
        </TabsList>

        {/* Edição Básica */}
        <TabsContent value="edit" className="space-y-6">
          <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden shadow-md">
            <img
              src={image.dataUrl || "/placeholder.svg"}
              alt={image.name}
              className="w-full h-full object-contain transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rotação</Label>
              <SliderPrimitive.Root
                value={[rotation]}
                min={0}
                max={180}
                step={1}
                onValueChange={(values) => setRotation(values[0])}
                className="relative flex w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-300">
                  <SliderPrimitive.Range className="absolute h-full bg-purple-500" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-white bg-purple-500 shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </SliderPrimitive.Root>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-500 hover:bg-indigo-500">
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </TabsContent>

        {/* Recorte */}
        <TabsContent value="crop" className="space-y-6">
          <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden shadow-md">
            <Cropper
              image={image.dataUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zoom</Label>
              <SliderPrimitive.Root
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(values) => setZoom(values[0])}
                className="relative flex w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-300">
                  <SliderPrimitive.Range className="absolute h-full bg-purple-500" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-white bg-purple-500 shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </SliderPrimitive.Root>
            </div>

            <div className="space-y-2">
              <Label>Rotação</Label>
              <SliderPrimitive.Root
                value={[rotation]}
                min={0}
                max={180}
                step={1}
                onValueChange={(values) => setRotation(values[0])}
                className="relative flex w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-300">
                  <SliderPrimitive.Range className="absolute h-full bg-purple-500" />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-white bg-purple-500 shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </SliderPrimitive.Root>
            </div>

            <div className="space-y-2">
              <Label>Dividir por colunas</Label>
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={columns}
                  onChange={(e) =>
                    setColumns(Number.parseInt(e.target.value) || 2)
                  }
                  className="w-24"
                />
                <Button variant="outline" onClick={handleColumnCrop} disabled={isSaving}>
                  Dividir Imagem
                </Button>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-500 hover:bg-indigo-500">
              {isSaving ? "Salvando..." : "Salvar Imagem Recortada"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>

  )
}
