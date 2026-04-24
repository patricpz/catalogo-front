"use client"

import { useEffect, useMemo, useState } from 'react'
import PublicProductCard from '@/components/products/PublicProductCard'
import { Button } from '@/components/ui'
import PageShell from '@/components/ui/PageShell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ShoppingCart, ChevronUp, ChevronDown, X } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: string
  image?: string
}

const sampleProducts: Product[] = [
  { id: 'p1', name: 'Camiseta Verde', price: 'R$ 49,90', image: "https://plus.unsplash.com/premium_photo-1668618295237-f1d8666812c9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 'p2', name: 'Café Especial 250g', price: 'R$ 19,90', image: undefined },
  { id: 'p3', name: 'Bolo de Caneca', price: 'R$ 14,50', image: undefined },
  { id: 'p4', name: 'Brigadeiro Gourmet', price: 'R$ 5,00', image: undefined },
]

export default function PublicCatalogPage() {
  const [products] = useState<Product[]>(sampleProducts)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [isCartOpen, setIsCartOpen] = useState(false) // Controle do carrinho no mobile
  
  const storeName = 'Minha Loja'
  const storePhone = '+5585998577294'

  useEffect(() => {
    const raw = localStorage.getItem('public_cart')
    if (raw) setCart(JSON.parse(raw))
  }, [])

  useEffect(() => {
    localStorage.setItem('public_cart', JSON.stringify(cart))
  }, [cart])

  function handleAdd(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
    setIsCartOpen(true) // Abre o carrinho automaticamente ao adicionar algo
  }

  function handleRemove(id: string) {
    setCart((c) => {
      const next = { ...c }
      delete next[id]
      return next
    })
  }

  const items = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const p = products.find((x) => x.id === id)!
      return { ...p, qty }
    })
  }, [cart, products])

  const totalItems = items.reduce((s, it) => s + it.qty, 0)

  function handleCheckoutWhatsApp() {
    if (items.length === 0) return alert('Carrinho vazio')

    const lines = items.map((it) => `${it.name} (${it.qty}x)`)
    const total = '—'
    const message = `Olá! Quero fazer um pedido da ${storeName}:\n${lines.join('\n')}\nTotal: ${total}`
    const url = `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <PageShell>
      {/* Padding menor no mobile (px-4 py-6), aumentando em telas maiores */}
      <div className="container mx-auto px-4 py-6 sm:px-6 md:py-12 pb-32 sm:pb-12">
        
        {/* HEADER: Avatar começa com w-24/h-24 e cresce para w-32/h-32 e w-40/h-40 */}
        <header className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-border shadow-sm sm:h-32 sm:w-32 md:h-40 md:w-40">
          <Avatar className="h-full w-full">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="@shadcn"
              className="object-cover"
            />
            <AvatarFallback>ML</AvatarFallback>
          </Avatar>
        </header>

        <div className="text-center mt-4 mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{storeName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            WhatsApp: {storePhone}
          </p>
        </div>

        {/* MAIN GRID: 1 coluna no mobile, 2 no tablet, 3/4 no desktop */}
        <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <PublicProductCard 
              key={p.id} 
              id={p.id} 
              name={p.name} 
              price={p.price} 
              image={p.image} 
              onAdd={handleAdd} 
            />
          ))}
        </main>

        {/* CARRINHO RESPONSIVO */}
        {totalItems > 0 && (
          <aside 
            id="cart" 
            className={`
              fixed bottom-0 left-0 z-50 w-full bg-background border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out
              sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 sm:rounded-2xl sm:border sm:shadow-xl
              ${isCartOpen ? 'translate-y-0' : 'translate-y-[calc(100%-72px)] sm:translate-y-0'}
            `}
          >
            {/* Header do Carrinho (Clicável no mobile para abrir/fechar) */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer sm:cursor-default"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-foreground" />
                <h3 className="text-lg font-semibold text-foreground">
                  Carrinho <span className="text-sm font-normal text-muted-foreground">({totalItems} itens)</span>
                </h3>
              </div>
              
              {/* Ícone de Toggle exclusivo para Mobile */}
              <div className="sm:hidden text-muted-foreground">
                {isCartOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </div>
            </div>

            {/* Conteúdo do Carrinho (Lista e Botão) */}
            <div className="px-4 pb-4 sm:block">
              <div className="space-y-3 max-h-[40vh] sm:max-h-64 overflow-y-auto pr-2 mb-4 scrollbar-thin">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground line-clamp-1">{it.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Qtd: {it.qty}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <div className="text-sm font-semibold text-foreground">{it.price}</div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita fechar a gaveta ao clicar em remover
                          handleRemove(it.id);
                        }} 
                        className="text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckoutWhatsApp();
                }} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 sm:py-4 text-base"
              >
                Finalizar no WhatsApp
              </Button>
            </div>
          </aside>
        )}
      </div>
    </PageShell>
  )
}