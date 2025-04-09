"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
import { getSharedLinks, deleteSharedLink } from "@/utils/local-storage-utils"
import type { SharedLink } from "@/types/share"

export default function SharePage() {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLinks = () => {
      try {
        const links = getSharedLinks()
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-6">Shared Links</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading shared links...</p>
          </div>
        ) : sharedLinks.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sharedLinks.map((link) => (
                  <tr key={link.uuid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/share/${link.uuid}`} className="text-blue-600 hover:underline">
                        {`${window.location.origin}/share/${link.uuid}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(link.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(link.expiresAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(link.uuid)}
                        className="text-red-600 hover:bg-red-50"
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
            <p className="text-gray-500 mb-4">No shared links found</p>
            <Link href="/gallery">
              <Button>Go to Gallery</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
