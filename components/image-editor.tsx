"use client"

import { useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Cropper from "react-easy-crop"
import type { Point, Area } from "react-easy-crop/types"
import { getCroppedImg } from "@/utils/crop-utils"
import type { StoredImage } from "@/types/image"

interface ImageEditorProps {
  image: StoredImage
  onSave: (editedImage: StoredImage) => void
}

export default function ImageEditor({ image, onSave }: ImageEditorProps) {
  const searchParams = useSearchParams()
  const initialMode = searchParams.get("mode") === "crop" ? "crop" : "edit"

  const [mode, setMode] = useState(initialMode)
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

      // Logic for column-based cropping would go here
      // This is a placeholder for the actual implementation

      const editedImage: StoredImage = {
        ...image,
        // Update with column-cropped image
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
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="edit">Basic Edit</TabsTrigger>
          <TabsTrigger value="crop">Crop</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <div className="aspect-square relative bg-gray-100 rounded-md overflow-hidden">
            <img src={image.dataUrl || "/placeholder.svg"} alt={image.name} className="w-full h-full object-contain" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rotation</Label>
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={(values) => setRotation(values[0])}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0°</span>
                <span>180°</span>
                <span>360°</span>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="crop" className="space-y-4">
          <div className="aspect-square relative bg-gray-100 rounded-md overflow-hidden">
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
              <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(values) => setZoom(values[0])} />
            </div>

            <div className="space-y-2">
              <Label>Rotation</Label>
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={(values) => setRotation(values[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>Crop by Columns</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={columns}
                  onChange={(e) => setColumns(Number.parseInt(e.target.value) || 2)}
                  className="w-20"
                />
                <Button variant="outline" onClick={handleColumnCrop} disabled={isSaving}>
                  Split Image
                </Button>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Cropped Image"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
