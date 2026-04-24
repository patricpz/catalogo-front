import React from 'react'
import * as Icons from 'lucide-react'

type Props = {
    title: string // Ex: "TOTAL SALES"
    value: string | number // Ex: "$24,450.80"
    // Propriedades para o ícone
    iconName: keyof typeof Icons // Nome do ícone (ex: 'Banknote', 'ClipboardCheck')
    iconBgColor: string // Classe Tailwind para o fundo da caixa do ícone (ex: 'bg-emerald-100/60')
    iconColor: string // Classe Tailwind para a cor do ícone (ex: 'text-emerald-600')
    // Propriedade opcional para a badge (delta ou "New")
    badge?: {
        text: string // O texto da badge (ex: "+12.5%", "New")
        bgColor: string // Classe Tailwind para o fundo da badge (ex: 'bg-emerald-50/50')
        textColor: string // Classe Tailwind para o texto da badge (ex: 'text-emerald-700')
    }
}

export default function MetricCard({ title, value, iconName, iconBgColor, iconColor, badge }: Props) {
    const IconComponent = Icons[iconName] as React.ElementType

    return (
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 flex flex-col gap-6">

            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${iconBgColor}`}>
                    <IconComponent className={`w-6 h-6 ${iconColor}`} />
                </div>

                {badge && (
                    <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${badge.bgColor} ${badge.textColor}`}>
                        {badge.text}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">{title}</div>

                <div className="text-4xl font-extrabold text-slate-900">{value}</div>
            </div>
        </div>
    )
}