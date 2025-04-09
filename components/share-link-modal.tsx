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

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Link</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input readOnly value={shareLink || ""} className="w-full" />
          </div>
          <Button type="button" size="icon" onClick={handleCopy} variant={copied ? "default" : "outline"}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          This link will expire in 7 days. Anyone with this link can view and download the shared images.
        </p>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
