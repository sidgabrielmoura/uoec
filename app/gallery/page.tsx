"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader, Loader2Icon, LogIn, LogOut, Menu, Share2, Trash, Upload } from "lucide-react"
import ImageGrid from "@/components/image-grid"
import { createSharedLink, getImages } from "@/utils/local-storage-utils"
import type { StoredImage } from "@/types/image"
import "../globals.css"
import { redirect } from "next/navigation"
import ShareLinkModal from "@/components/share-link-modal"
import { clearSupabaseImages, deleteImageFromSupabase, getImagesFromSupabase, logout } from "@/utils/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import LoginModal from "@/components/login-modal"
import { createClient } from "@supabase/supabase-js"

export default function GalleryPage() {
  const [images, setImages] = useState<StoredImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sizeMemory, setSizeMemory] = useState({
    used: "0.00",
    total: "10.00",
    isNearLimit: false
  })
  const [sizeMemoryDb, setSizeMemoryDb] = useState({
    used: "0.00",
    total: "10.00",
    isNearLimit: false,
  })
  const [selectedImage, setSelectedImage] = useState<StoredImage[] | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [findEmail, setFindEmail] = useState(false)

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    setUserEmail(email)
    const loadImages = () => {
      try {
        getImagesFromSupabase().then((response) => {
          if (response.success && response.data) {
            setImages(response.data as StoredImage[])
            console.log("imagens carregadas com sucesso:", response.data)
          } else {
            console.error("falha ao buscar imagens:", response.error)
          }
        }).catch((error) => {
          console.error("Erro buscando imagens:", error)
        })
      } catch (error) {
        console.error("falha ao carregar as imagens:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
    getLocalStorageUsage()
    getDatabaseUsage()
  }, [])

  function getLocalStorageUsage() {
    let total = 0

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key)
        total += key.length + (value?.length || 0)
      }
    }

    const usedMB = ((total * 2) / 1024) / 1000
    const totalMB = 10
    const remainingMB = totalMB - usedMB
    const isNearLimit = remainingMB < 1

    setSizeMemory({
      used: usedMB.toFixed(2),
      total: totalMB.toFixed(2),
      isNearLimit
    })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  async function getDatabaseUsage() {
    try {
      // Supondo que você tenha uma tabela chamada "images"
      const { data, error } = await supabase
        .from('imagens')
        .select('id, created_at, size') // Exemplo: Adicionando um campo "file_size" que representa o tamanho do arquivo

      if (error) {
        console.error("Erro ao buscar dados:", error)
        return
      }

      // Supondo que o tamanho do arquivo esteja armazenado em um campo "file_size" (em bytes)
      const totalUsedBytes = data.reduce((acc, image) => acc + (image.size || 0), 0)

      const usedMB = totalUsedBytes / (1024 * 1024)
      const totalMB = 8000 // 8 GB
      const remainingMB = totalMB - usedMB
      const isNearLimit = remainingMB < 1

      setSizeMemoryDb({
        used: usedMB.toFixed(2),
        total: totalMB.toFixed(2),
        isNearLimit,
      })

      console.log("Uso do banco de dados:", { usedMB, totalMB, isNearLimit })
    } catch (error) {
      console.error("Erro ao calcular o uso do banco:", error)
    }
  }

  const handleShare = async (image: StoredImage[]) => {
    setSelectedImage(image)
  
    try {
      const link = await createSharedLink([...image])
      const fullUrl = `${window.location.origin}/share/${link.uuid}`
      setShareLink(fullUrl)
      setIsShareModalOpen(true)
    } catch (error) {
      console.error("Failed to create shared link:", error)
    }
  }

  const clearGallery = () => {
    setClearLoading(true)
    setTimeout(async () => {
      await clearSupabaseImages()
      setImages([])
      setClearLoading(false)
    }, 1000);
  }

  const handleDelete = async (id: string) => {
    const response = await deleteImageFromSupabase(id)
    if (response.success) {
      setImages((prevImages) => prevImages.filter((image) => image.id !== id))
    }
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const [loading, setLoading] = useState(false)
  const navigateTo = (path: string) => {
    setLoading(true)
    setTimeout(() => {
      redirect(path)
    }, 1000);
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="honeycomb">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div onClick={() => navigateTo('/')}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao inicio
                </Button>
              </div>

              <div className="sm:hidden">
                <Popover>
                  <PopoverTrigger asChild>
                    <Menu/>
                  </PopoverTrigger>

                  <PopoverContent className="w-60 p-2 rounded-xl space-y-2 shadow-xl bg-zinc-900 border-zinc-700 mr-2">
                    <Button
                      onClick={clearGallery}
                      disabled={clearLoading || images.length === 0}
                      className="w-full justify-start gap-2 bg-red-700/70 hover:bg-red-800/70 border border-red-600"
                    >
                      <Trash className="h-4 w-4" />
                      Limpar galeria
                    </Button>

                    <Button
                      onClick={() => navigateTo('/upload')}
                      className="w-full justify-start gap-2 bg-zinc-700 hover:bg-zinc-800"
                    >
                      <Upload className="h-4 w-4" />
                      Carregar imagens
                    </Button>

                    <Button
                      onClick={() => handleShare([...images])}
                      className="w-full justify-start gap-2 bg-blue-700 hover:bg-blue-800"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2 items-center max-sm:hidden">
                {userEmail ? (
                  <div onClick={handleLogout}>
                    <Button size="sm" className="gap-2 bg-red-700 hover:bg-red-700 border border-red-500">
                      <LogOut className="h-4 w-4" />
                      Sair da conta
                    </Button>
                  </div>
                ) : (
                  <div onClick={() => setFindEmail(true)}>
                    <Button size="sm" className="gap-2 bg-indigo-500 hover:bg-indigo-500 border border-indigo-300">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </div>
                )}

                {userEmail && (
                  <button disabled={!userEmail} className={`${userEmail ? 'tooltip-container' : ''} disabled:opacity-50`} onClick={() => handleShare([...images])}>
                    <div className="button-content">
                      <span className="text">Compartilhar</span>
                      <svg
                        className="share-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                      >
                        <path
                          d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
                        ></path>
                      </svg>
                    </div>
                  </button>
                )}

                <Popover>
                  <PopoverTrigger asChild>
                    <Avatar className="size-10 cursor-pointer bg-zinc-700 border border-zinc-600">
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                  </PopoverTrigger>

                  <PopoverContent className="w-60 p-2 rounded-xl space-y-2 shadow-xl bg-zinc-900 border-zinc-700 mr-5 mt-5">
                    <Button
                      onClick={clearGallery}
                      disabled={clearLoading || images.length === 0}
                      className="w-full justify-start gap-2 bg-red-700/70 hover:bg-red-800/70 border border-red-600"
                    >
                      <Trash className="h-4 w-4" />
                      Limpar galeria
                    </Button>

                    <Button
                      onClick={() => navigateTo('/upload')}
                      className="w-full justify-start gap-2 bg-zinc-700 hover:bg-zinc-800"
                    >
                      <Upload className="h-4 w-4" />
                      Carregar imagens
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <div className="flex flex-col -space-y-6 mb-8">
                <h1 className="text-3xl font-bold mb-6">Galeria de imagens</h1>
                <div className="flex max-sm:flex-col sm:gap-4">
                  <h1 className="ml-1 text-zinc-400 flex gap-2">
                    espaço local:
                    <span className={sizeMemory.isNearLimit ? "text-red-500 font-semibold" : ""}>
                      {sizeMemory.used} MB / {sizeMemory.total} MB
                    </span>
                  </h1>
                  <h1 className="ml-1 text-zinc-400 flex gap-2">
                    espaço db:
                    <span className={sizeMemory.isNearLimit ? "text-red-500 font-semibold" : ""}>
                      {sizeMemoryDb.used} MB / {sizeMemoryDb.total} MB
                    </span>
                  </h1>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Carregando imagens...</p>
                </div>
              ) : images.length > 0 ? (
                <ImageGrid images={images} onDelete={handleDelete} />
              ) : (
                <div className="flex flex-col mt-52 space-y-4 items-center justify-center h-64 text-center">
                  <div className="w-full flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-zinc-600 pulse w-full h-[500px] rounded-2xl" />
                    ))}
                  </div>
                  <div onClick={() => navigateTo('/upload')}>
                    <Button className="bg-indigo-500 hover:bg-indigo-500 button-up">Carregar imagens</Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareLink={shareLink}
      />
      <LoginModal
        isOpen={findEmail}
        onClose={() => setFindEmail(false)}
      />
    </>
  )
}
