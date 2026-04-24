import React from 'react'
import { Zap, RefreshCw, MessageSquare } from 'lucide-react'

export default function Features() {
  return (
    <div className="w-full">
      <div className="mb-12 lg:mb-16">
        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
          Projetado para o <span className="text-green-600">Crescimento</span>
        </h2>
        <p className="text-slate-600 max-w-2xl text-lg">
          Tudo o que você precisa para tirar o seu negócio do caderninho e levá-lo para um catálogo digital de alta conversão.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
            <Zap className="h-6 w-6 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Setup simples</h3>
          <p className="text-slate-600 leading-relaxed">
            Lance seu catálogo em menos de 5 minutos. Sem código, sem hospedagem complexa, apenas faça o upload e venda.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
            <RefreshCw className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Atualizações em tempo real</h3>
          <p className="text-slate-600 leading-relaxed">
            Sincronize preços, descrições e níveis de estoque instantaneamente. Seus clientes sempre veem o inventário mais recente.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
            <MessageSquare className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Pedidos direto no WhatsApp</h3>
          <p className="text-slate-600 leading-relaxed">
            Os pedidos chegam diretamente no seu chat do WhatsApp com uma lista clara de itens e detalhes do cliente.
          </p>
        </div>
      </div>
    </div>
  )
}