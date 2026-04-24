import React from 'react'

export default function CatalogPreview() {
  return (
    <div className="bg-white rounded-base shadow-card p-4 max-w-sm mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-[var(--accent)]" />
        <div>
          <div className="text-sm font-semibold text-foreground">Minha Loja</div>
          <div className="text-xs text-[var(--muted)]">@minhaloja</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-24 rounded-md bg-gray-100" />
        <div className="h-24 rounded-md bg-gray-100" />
        <div className="h-24 rounded-md bg-gray-100" />
        <div className="h-24 rounded-md bg-gray-100" />
      </div>

      <div className="mt-4">
        <button className="w-full rounded-md bg-[var(--accent)] py-2 text-white">Visualizar catálogo</button>
      </div>
    </div>
  )
}
