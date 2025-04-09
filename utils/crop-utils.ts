import type { Area } from "react-easy-crop/types"

/**
 * Creates a new image with the cropped area from the source image
 */
export const getCroppedImg = async (imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string | null> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return null
  }

  // Set canvas dimensions to the cropped area size
  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Draw the cropped image onto the canvas
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Translate canvas context to a central location to allow rotation and flipping around the center
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-canvas.width / 2, -canvas.height / 2)

  // Draw the image at the correct position with the crop
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

  // Return the cropped image as a data URL
  return canvas.toDataURL("image/jpeg")
}

/**
 * Creates an image element from a source URL
 */
const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.crossOrigin = "anonymous" // To avoid CORS issues
    image.src = url
  })
}

/**
 * Splits an image into equal columns
 */
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

    // Draw the portion of the image for this column
    ctx.drawImage(
      image,
      i * columnWidth, // Source x
      0, // Source y
      columnWidth, // Source width
      image.height, // Source height
      0, // Destination x
      0, // Destination y
      columnWidth, // Destination width
      image.height, // Destination height
    )

    results.push(canvas.toDataURL("image/jpeg"))
  }

  return results
}
