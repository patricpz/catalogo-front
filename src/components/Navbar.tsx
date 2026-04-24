'use client'

import React, { useState } from 'react';
import { 
  LayoutGrid, Box, ShoppingBag, Users, BarChart2, Settings, Plus, LifeBuoy, LogOut 
} from 'lucide-react';
import { Button } from './ui/Button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [activeItem, setActiveItem] = useState('Overview');
  const router = useRouter();
  

  const navItems = [
    { name: 'Geral', icon: LayoutGrid, link: '/dashboard' },
    { name: 'Produtos', icon: Box, link: '/dashboard/products' },
    { name: 'Catálogo', icon: Box, link: '/dashboard/catalog' },
    { name: 'Pedidos', icon: ShoppingBag, link: '/dashboard/orders' },
    { name: 'Clientes', icon: Users, link: '/dashboard/customers' },
    { name: 'Análises', icon: BarChart2, link: '/dashboard/analytics' },
    { name: 'Configurações', icon: Settings, link: '/dashboard/settings' },
  ];

  return (
    <aside className="flex flex-col justify-between w-[260px] h-screen p-6 bg-slate-50 border-r border-slate-200">
      
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.name;
          return (
            <Button
              key={item.name}
              variant={isActive ? "outline" : "ghost"}
              className={`justify-start gap-3 w-full text-[14px] ${
                isActive 
                  ? "bg-white text-emerald-800 border-slate-200 shadow-sm hover:bg-slate-50 hover:text-emerald-900" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              onClick={() => {
                setActiveItem(item.name);
                router.push(item.link);
              }}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Button>
          );
        })}
      </div>

      {/* Seção Inferior - Botões de Ação */}
      <div className="flex flex-col gap-8">
        {/* Botão Principal */}
        <Button className="w-full gap-2 bg-[#006d3a] hover:bg-[#00592f] text-white">
          <Plus strokeWidth={3} className="w-4 h-4" />
          Create Product
        </Button>

        {/* Links do Rodapé */}
        <div className="flex flex-col gap-1">
          <Button variant="ghost" className="justify-start gap-3 w-full text-slate-500 hover:text-slate-900 font-normal">
            <LifeBuoy className="w-4 h-4" />
            Support
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-3 w-full text-slate-500 hover:text-slate-900 font-normal"
            onClick={() => router.push('/logout')}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

    </aside>
  );
}
