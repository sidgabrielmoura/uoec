import { Check, CheckCircle, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [email, setEmail] = useState<string>("")
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(false)

    const handleSaveEmail = () => {
        if (!email || email.length < 5) {
            setError(true)
            return
        }

        if (email) {
            localStorage.setItem('userEmail', email)
        }

        const emailSaved = localStorage.getItem('userEmail')
        if(emailSaved){
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                onClose()
            }, 2000);
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-xl shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Informe seu email!
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-2">
                        <Input
                            type="email"
                            placeholder="Digite seu email"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            autoFocus
                            spellCheck="false"
                            className={`flex-1 bg-zinc-800 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-150
                            focus:border-indigo-500 outline-none focus:ring-2 focus:ring-indigo-500 ${error ? "border-red-500 placeholder:text-red-500" : ""}`}
                            onFocus={() => setError(false)}
                        />
                        <Button
                            type="button"
                            size="icon"
                        >
                        </Button>
                    </div>

                    <p className="text-xs text-zinc-400">
                        Informe seu email para ter a melhor experiência na nossa aplicação.
                        <span className="text-indigo-400 font-medium"> Não se preocupe, não enviaremos spam.</span>
                    </p>
                </div>

                <DialogFooter className="mt-4 sm:justify-end">
                    <Button type="button" variant="ghost" onClick={handleSaveEmail} className="text-zinc-50 bg-indigo-500 hover:bg-indigo-500 w-full">
                        Enviar
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-50 bg-zinc-600 hover:bg-zinc-600">
                        Fechar
                    </Button>
                </DialogFooter>

                {success && (
                    <div className="mt-6 p-4 border border-green-500 bg-green-950 text-green-400 rounded-lg shadow-sm">
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-[14px]">Tudo certo, já pode começar a ter uma experiência imersiva com U.O.E.C Uploader</span>
                    </div>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}