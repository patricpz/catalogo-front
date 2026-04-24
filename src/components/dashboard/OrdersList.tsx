import React from 'react'

type Order = {
  id: string
  customer: string
  total: string
  status: 'new' | 'paid' | 'sent'
}

const sample: Order[] = [
  { id: '1001', customer: 'Maria', total: 'R$ 129,90', status: 'new' },
  { id: '1002', customer: 'João', total: 'R$ 49,00', status: 'paid' },
  { id: '1003', customer: 'Ana', total: 'R$ 32,50', status: 'sent' },
]

export default function OrdersList({ orders = sample }: { orders?: Order[] }) {
  return (
    <div className="bg-white rounded-base shadow-card p-4">
      <h3 className="text-lg font-semibold text-foreground">Pedidos recentes</h3>
      <ul className="mt-3 space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">#{o.id} — {o.customer}</div>
              <div className="text-xs text-[var(--muted)]">{o.total}</div>
            </div>
            <div className={`text-sm ${o.status === 'new' ? 'text-green-600' : 'text-[var(--muted)]'}`}>{o.status}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
