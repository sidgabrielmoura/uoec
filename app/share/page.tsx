"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
import { getSharedLinks, deleteSharedLink } from "@/utils/local-storage-utils"
import type { SharedLink } from "@/types/share"
import { redirect } from "next/navigation"

export default function SharePage() {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const links = await getSharedLinks()
        setSharedLinks(links)
      } catch (error) {
        console.error("Failed to load shared links:", error)
      } finally {
        setIsLoading(false)
      }
    }
  
    loadLinks()
  }, [])

  const handleDelete = (uuid: string) => {
    try {
      deleteSharedLink(uuid)
      setSharedLinks(sharedLinks.filter((link) => link.uuid !== uuid))
    } catch (error) {
      console.error("Failed to delete shared link:", error)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const [loading, setLoading] = useState(false)
  const navigateTo = (path: string) => {
    setLoading(true)
    setTimeout(() => {
      redirect(path)
    }, 1000);
  }

  return (
    <main className="container mx-auto px-4 py-10">
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
          <div className="mb-6">
            <div onClick={() => navigateTo('/')}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao início
              </Button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Links Compartilhados</h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-neutral-500">Carregando links...</p>
            </div>
          ) : sharedLinks.length > 0 ? (
            <div className="overflow-auto rounded-2xl border border-zinc-700 shadow-sm">
              <table className="min-w-full divide-y divide-zinc-600 text-sm">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Link</th>
                    <th className="px-6 py-3 text-left font-medium">Criado em</th>
                    <th className="px-6 py-3 text-left font-medium">Expira em</th>
                    <th className="px-6 py-3 text-left font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-600 bg-zinc-700">
                  {sharedLinks.map((link) => (
                    <tr key={link.uuid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div onClick={() => navigateTo(`/share/${link.uuid}`)} className="text-blue-300 hover:underline break-all cursor-pointer">
                          {`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${link.uuid}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(link.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(link.expiresAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(link.uuid)}
                          className="text-red-500 hover:text-red-600 hover:bg-zinc-600"
                          aria-label="Excluir link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-neutral-500 mb-4">Nenhum link compartilhado encontrado</p>
              <div onClick={() => navigateTo('/gallery')}>
                <Button className="text-sm bg-indigo-500 hover:bg-indigo-500 button-up">Ir para Galeria</Button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
