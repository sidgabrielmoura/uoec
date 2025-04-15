import type { Area } from "react-easy-crop"

export const getCroppedImg = async (imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string | null> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return null
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-canvas.width / 2, -canvas.height / 2)

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return canvas.toDataURL("image/jpeg")
}

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.crossOrigin = "anonymous"
    image.src = url
  })
}

export const splitImageIntoColumns = async (imageSrc: string, columns: number): Promise<string[]> => {
  const image = await createImage(imageSrc)
  const columnWidth = image.width / columns
  const results: string[] = []

  for (let i = 0; i < columns; i++) {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) continue

    canvas.width = columnWidth
    canvas.height = image.height

    ctx.drawImage(
      image,
      i * columnWidth,
      0,
      columnWidth,
      image.height,
      0,
      0,
      columnWidth,
      image.height,
    )

    results.push(canvas.toDataURL("image/jpeg"))
  }

  return results
}
