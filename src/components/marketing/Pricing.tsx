import React from 'react'
import { Check, ChevronDown } from 'lucide-react'

export default function Pricing() {
  return (
    <div className="w-full">
      {/* SEÇÃO DE PREÇOS */}
      <div className="text-center mb-12 lg:mb-16">
        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
          Planos que escalam com você
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center mb-24">
        
        {/* Free Plan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-slate-900">Grátis</h3>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-slate-900">R$ 0</span>
            <span className="text-slate-500 font-medium"> /mês</span>
          </div>
          <ul className="space-y-4 mb-8">
            {['Até 10 produtos', 'Integração básica WhatsApp', 'Domínio compartilhado'].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-slate-600">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full rounded-lg border-2 border-slate-200 py-3 font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
            Começar grátis
          </button>
        </div>

        {/* Basic Plan (Popular) */}
        <div className="relative rounded-2xl border-2 border-green-500 bg-white p-8 shadow-xl md:-mt-8 md:mb-8">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-max rounded-full bg-green-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Mais Popular
          </div>
          <h3 className="text-lg font-bold mb-2 text-slate-900">Básico</h3>
          <div className="mb-6">
            <span className="text-5xl font-extrabold text-slate-900">R$ 49</span>
            <span className="text-slate-500 font-medium"> /mês</span>
          </div>
          <ul className="space-y-4 mb-8">
            {['100 produtos', 'Domínio personalizado', 'Histórico de pedidos e métricas', 'Suporte prioritário'].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-slate-600">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full rounded-lg bg-green-600 py-3 font-bold text-white transition-colors hover:bg-green-700">
            Assinar Plano
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-bold mb-2 text-slate-900">Empresarial</h3>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-slate-900">R$ 149</span>
            <span className="text-slate-500 font-medium"> /mês</span>
          </div>
          <ul className="space-y-4 mb-8">
            {['Produtos ilimitados', 'Dashboard multi-usuário', 'Acesso à API', 'Gerente de contas'].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-slate-600">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full rounded-lg border-2 border-slate-200 py-3 font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
            Falar com Vendas
          </button>
        </div>

      </div>

      {/* SEÇÃO DE FAQ (Perguntas Frequentes) */}
      <div className="max-w-3xl mx-auto pt-12 border-t border-slate-200">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-center mb-10 text-slate-900">
          Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          {[
            'Preciso de uma conta WhatsApp Business?',
            'Posso usar meu próprio domínio?',
            'Existe limite de pedidos mensais?',
            'Como funcionam os pagamentos?'
          ].map((question, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="font-semibold text-slate-800">{question}</span>
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}