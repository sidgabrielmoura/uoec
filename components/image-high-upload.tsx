import { useCallback, useState } from "react";
import { Input } from "./ui/input";
import { useDropzone } from "react-dropzone";
import Image from "next/image"
import { X } from "lucide-react";
import "../app/globals.css"
import { Button } from "./ui/button";

interface ImageUploaderProps {
    onUpload: (filesOrEvent: { file: File; highQuality: boolean }[] | Event) => Promise<void>
    highQuality?: boolean
    isUploading: boolean
}
export default function ImageHighUpload({ onUpload, isUploading }: ImageUploaderProps) {
    const [previewHighImage, setPreviewHighImage] = useState<{file: File; preview: string, highQuality: boolean}[]>([])

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newPreviewFiles = acceptedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            highQuality: true,
        }))
        setPreviewHighImage((prev) => [...prev, ...newPreviewFiles,])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
    })

    const removeFile = (index: number) => {
        setPreviewHighImage((prev) => {
            const newFiles = [...prev]
            newFiles.splice(index, 1)
            return newFiles
        })
    }

    const handleUpload = () => {
        if (previewHighImage.length > 0) {
            onUpload(previewHighImage.map((pf) => ({ file: pf.file, highQuality: pf.highQuality })))
        }
    }

    return(
        <>
            <div className="w-full mt-5">
                <div className="flex justify-center w-full">

                {previewHighImage.length === 0 ? (
                    <label htmlFor="file" className="bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-500/80 transition-all duration-200 w-full boton-elegante">
                        Carregar imagem em alta resolução
                        (opcional)
                    </label>
                ) : (
                    <div className="flex justify-end w-full">
                        <Button onClick={handleUpload} disabled={isUploading} className="bg-indigo-500 hover:bg-indigo-500 w-full boton-elegante">
                            {isUploading
                            ? "carregando..."
                            : `Confirmar imagem em alta resolução ( 0${previewHighImage.length} )`}
                        </Button>
                    </div>
                )}
                
                <Input
                    type="file"
                    id="file"
                    {...getInputProps()}
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) {
                            const files = Array.from(e.target.files)
                            onDrop(files)
                        }
                    }}
                />
                </div>
            </div>

            {previewHighImage.map((file, index) => (
                <div key={index} className="relative group max-h-[200px] mt-3">
                    <div className="aspect-square rounded-2xl overflow-hidden max-h-[200px] bg-gray-100">
                        <Image
                            src={file.preview || "/placeholder.svg"}
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
                    <p className="text-xs mt-1 truncate">{file.file.name}</p>
                </div>
            ))}
        </>
    )
}