import React from 'react'
import { Globe, ShoppingBag } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-12 mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-blue-600 shadow-sm">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SaaS Catalog</span>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} SaaS Catalog Inc. Todos os direitos reservados.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</a>
          <a href="/termos" className="hover:text-foreground transition-colors">Termos de Serviço</a>
          <a href="/api" className="hover:text-foreground transition-colors">API</a>
          <a href="/status" className="hover:text-foreground transition-colors">Status</a>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[var(--accent)] hover:text-white transition-colors" aria-label="Website">
            <Globe className="h-4 w-4" />
          </button>
        </div>
        
      </div>
    </footer>
  )
}