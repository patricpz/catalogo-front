import React from 'react'
import { Button } from '@/components/ui'

type Product = {
  id: string
  name: string
  price: string
  description?: string
  image?: string
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="bg-white rounded-base shadow-card overflow-hidden">
      <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-[var(--muted)]">Sem imagem</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">{product.name}</div>
            <div className="mt-1 text-sm text-[var(--muted)]">{product.description}</div>
          </div>
          <div className="text-lg font-bold text-foreground">{product.price}</div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={() => onEdit(product)} className="px-3 py-1">
            Editar
          </Button>
          <Button variant="ghost" onClick={() => onDelete(product.id)} className="px-3 py-1 text-red-600">
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}
