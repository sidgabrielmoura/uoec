"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Check, Copy } from "lucide-react"

interface ShareLinkModalProps {
  isOpen: boolean
  onClose: () => void
  shareLink: string | null
}

export default function ShareLinkModal({ isOpen, onClose, shareLink }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink)
  
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error("Erro ao copiar para a área de transferência:", error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            🔗 Compartilhar Imagem
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareLink || ""}
              className="flex-1 bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleCopy}
              variant={copied ? "default" : "outline"}
              className={copied ? "bg-indigo-500 text-white" : "border-zinc-600"}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-xs text-zinc-400">
            Este link expira em <span className="text-indigo-400 font-medium">7 dias</span>. 
            Qualquer pessoa com o link poderá visualizar e baixar as imagens.
          </p>
        </div>

        <DialogFooter className="mt-4 sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-50 bg-indigo-500 hover:bg-indigo-500">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
