import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, Share2, Phone } from "lucide-react"
import '../app/globals.css'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 select-none">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-5xl font-bold btn-shine">U.O.E.C Uploader</h1>
          <p className="text-lg text-gray-400 max-w-md">
            Faça Upload, Organize, Edite e Compartilhe suas imagens de forma fácil e rápida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          <Link href="/upload" className="w-full">
            <Button variant="outline" className="boton-elegante w-full h-32 flex flex-col gap-2 border-zinc-600 bg-indigo-600 hover:bg-indigo-600 transition-all duration-200 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.8)] rounded-2xl">
              <Upload className="h-8 w-8" />
              <span>Carregar Imagens</span>
            </Button>
          </Link>

          <Link href="/gallery" className="w-full">
            <Button variant="outline" className="boton-elegante w-full h-32 flex flex-col gap-2 border-zinc-600 bg-indigo-600 hover:bg-indigo-600 transition-all duration-200 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.8)] rounded-2xl">
              <ImageIcon className="h-8 w-8" />
              <span>Ver na Galeria</span>
            </Button>
          </Link>

          <Link href="/share" className="w-full">
            <Button variant="outline" className="boton-elegante w-full h-32 flex flex-col gap-2 border-zinc-600 bg-indigo-600 hover:bg-indigo-600 transition-all duration-200 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.8)] rounded-2xl">
              <Share2 className="h-8 w-8" />
              <span>Links Compartilhados</span>
            </Button>
          </Link>
        </div>

        <Button className="btn-donate flex items-center mt-8 gap-5 px-10 py-2 rounded-full bg-green-600 text-white">
          <Phone className="size-10"/>
          <a href="https://wa.me/5585992295470" target="_blank" className="max-sm:hidden">Entrar em contato com o desenvolvedor</a>
          <a href="https://wa.me/5585992295470" target="_blank" className="sm:hidden">Suporte</a>
        </Button>
      </div>
    </main>
  )
}
