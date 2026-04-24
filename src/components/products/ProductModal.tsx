"use client"

import React, { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Input, Button } from '@/components/ui'

type Product = {
  id?: string
  name: string
  price: string
  description?: string
  image?: string
}

export default function ProductModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (p: Product) => void
  initial?: Product | null
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setPrice(initial.price || '')
      setDescription(initial.description || '')
      setImagePreview(initial.image || null)
    } else {
      setName('')
      setPrice('')
      setDescription('')
      setImagePreview(null)
    }
  }, [initial, open])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setImagePreview(url)
  }

  function handleSave() {
    const product: Product = {
      id: initial?.id ?? String(Date.now()),
      name,
      price,
      description,
      image: imagePreview ?? undefined,
    }
    onSave(product)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar produto' : 'Novo produto'}>
      <div className="flex flex-col gap-3">
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Preço" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="R$ 0,00" />
        <label className="text-sm text-[var(--muted)]">Descrição</label>
        <textarea className="w-full rounded-base border border-[var(--border)] p-2" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div>
          <label className="text-sm text-[var(--muted)] block mb-1">Imagem</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {imagePreview && <div className="mt-2"><img src={imagePreview} alt="preview" className="h-24 object-cover rounded-md"/></div>}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>
    </Modal>
  )
}
