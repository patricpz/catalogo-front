import React from 'react'
import { PlayCircle } from 'lucide-react'

export default function Hero() {
  return (
    <div className="relative overflow-hidden w-full">
      {/* Efeito de brilho no fundo (Opcional, dá um toque moderno) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] bg-green-200/40 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Texto Hero */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-700 mb-6">
            Catálogo Pro
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900">
            Venda mais no <span className="text-green-600">WhatsApp</span> com um catálogo profissional.
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
            A forma mais simples para pequenos negócios criarem uma loja online e receberem pedidos diretamente no WhatsApp. Transforme conversas em conversões hoje.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg bg-green-600 px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-green-700"
            >
              Criar Loja Grátis
            </a>
            <button className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-8 text-base font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-green-600">
              <PlayCircle className="h-5 w-5 text-green-600" />
              Ver Demonstração
            </button>
          </div>
        </div>

        {/* Imagem Hero - Dashboard Placeholder */}
        <div className="relative rounded-2xl bg-slate-200/50 p-4 lg:p-6 shadow-2xl shadow-green-900/10 border border-slate-100">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
            alt="Dashboard Mockup" 
            className="rounded-xl border border-slate-700/10 shadow-lg object-cover w-full h-auto aspect-video"
          />
        </div>
      </div>
    </div>
  )
}