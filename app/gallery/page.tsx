"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader, Loader2Icon, LogIn, LogOut, Menu, Share2, Trash, Upload } from "lucide-react"
import ImageGrid from "@/components/image-grid"
import type { StoredImage } from "@/types/image"
import "../globals.css"
import { redirect } from "next/navigation"
import ShareLinkModal from "@/components/share-link-modal"
import { clearSupabaseImages, createSharedLink, deleteImageFromSupabase, getImagesFromSupabase, logout, updateGalleryName } from "@/utils/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import LoginModal from "@/components/login-modal"
import { createClient } from "@supabase/supabase-js"

export default function GalleryPage() {
  const [images, setImages] = useState<StoredImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<StoredImage[] | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [findEmail, setFindEmail] = useState(false)
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('')
  const [loadingShare, setLoadingShare] = useState(false)

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    setUserEmail(email)
    const loadImages = () => {
      try {
        getImagesFromSupabase().then((response) => {
          if (response.success && response.data) {
            setImages(response.data as StoredImage[])
            console.log("imagens carregadas com sucesso:", response.data)

            if(response.data && response.data[0].belogs_gallery){
              setValue(response.data[0].belogs_gallery)
            }else setValue('Galeria de imagens')

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
  }, [])

  const handleShare = async (image: StoredImage[]) => {
    setLoadingShare(true)
    setSelectedImage(image)
    setIsShareModalOpen(true)
    setShareLink('')

    try {
      const link = await createSharedLink([...image])
      const fullUrl = `${window.location.origin}/share/${link.uuid}`
      setShareLink(fullUrl)
      setLoadingShare(false)
    } catch (error) {
      console.error("Failed to create shared link:", error)
      setLoadingShare(false)
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

  const handleChangeGalleryName = async () => {
    const name = value
    if(name.length < 4){
      console.log('o nome da galeria tem que ser maior que 4 caracteres')
      return
    }

    localStorage.setItem('gallery_name', value)
    await updateGalleryName(name)
    setIsEditing(false)
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
                    <Menu />
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
                      disabled={images.length === 0 || loadingShare}
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
                    <Button size="sm" className="gap-2 bg-indigo-500 hover:bg-indigo-500 border boton-elegante">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </div>
                )}

                {userEmail && (
                  <button disabled={!userEmail || images.length === 0 || loadingShare} className={`${userEmail ? 'tooltip-container' : ''} disabled:opacity-50`} onClick={() => handleShare([...images])}>
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

            <div className="mt-20">
              <div onDoubleClick={() => setIsEditing(true)} className="mb-5">
                {isEditing ? (
                  <input
                    className="text-6xl w-auto font-bold bg-transparent outline-none"
                    value={value}
                    autoFocus
                    onBlur={handleChangeGalleryName}
                    onChange={(e) => setValue(e.target.value)}
                  />
                ) : (
                  <span className="text-6xl w-auto font-bold cursor-pointer">
                    {value}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Carregando imagens...</p>
                </div>
              ) : images.length > 0 ? (
                <ImageGrid images={images} onDelete={handleDelete} />
              ) : (
                <div className="flex flex-col mt-44 space-y-4 items-center justify-center h-64 text-center">
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
