"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  Plus,
  LifeBuoy,
  LogOut,
  Store,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { clearAuthToken } from "@/lib/auth/storage";

const navItems = [
  { name: "Visao Geral", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produtos", href: "/dashboard/products", icon: Package },
  { name: "Pedidos", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Catalogo", href: "/dashboard/catalog", icon: Store },
  { name: "Configuracoes", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    clearAuthToken();
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Store className="h-6 w-6 text-green-700" />
        <span className="ml-3 text-lg font-bold tracking-tight text-slate-900">DevFlow</span>
      </div>

      <nav className="flex-1 px-3 pt-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-green-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 px-3 py-4">
        <Button
          className="w-full gap-2 bg-green-700 hover:bg-green-800 text-white text-sm"
          onClick={() => {
            router.push("/dashboard/products");
            setOpen(false);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
        <div className="mt-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-sm text-slate-500">
            <LifeBuoy className="h-4 w-4" />
            Suporte
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-sm text-slate-500" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md border border-slate-200 lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-slate-50 fixed top-0 left-0 h-screen z-40">
        {sidebar}
      </aside>

      {/* Sidebar mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 shadow-xl z-50">{sidebar}</aside>
        </div>
      )}
    </>
  );
}
