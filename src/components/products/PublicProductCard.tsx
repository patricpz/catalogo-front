"use client"

import React from 'react'
import { Button } from '@/components/ui'

type Props = {
  id: string
  name: string
  price: string
  image?: string
  onAdd: (id: string) => void
}

export default function PublicProductCard({ id, name, price, image, onAdd }: Props) {
  return (
    <div className="bg-white rounded-base shadow-card overflow-hidden flex flex-col border-2 border-black rounded-lg">
      <div className="h-44 w-full bg-gray-100 flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="">Sem imagem</div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold">{name}</div>
            <div className="mt-1 text-sm ">{price}</div>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={() => onAdd(id)} className="w-full">
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  )
}
