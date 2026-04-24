"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useToast } from "@/contexts/toast-context";
import Skeleton from "@/components/Skeleton";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product as ProductType,
} from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";

type ProductForm = {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductType | null>(null);
  const [form, setForm] = useState<ProductForm>({ id: "", name: "", description: "", price: "" });
  const { success, error } = useToast();
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
  const updateProductMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateProduct>[1] }) =>
      updateProduct(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ id: "", name: "", description: "", price: "" });
    setModalOpen(true);
  }

  function openEdit(p: ProductType) {
    setEditing(p);
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      image: p.image || undefined,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price.trim()) {
      error("Campos obrigatorios", "Preencha nome e preco.");
      return;
    }
    try {
      const price = typeof form.price === "string"
        ? parseFloat(form.price.replace(",", "."))
        : Number(form.price);
      if (!Number.isFinite(price) || price <= 0) {
        error("Preco invalido", "Informe um preco numerico valido.");
        return;
      }
      const input = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        image: form.image || undefined,
        available: true,
      };
      if (editing) {
        await updateProductMutation.mutateAsync({ id: editing.id, input });
        success("Produto atualizado", `"${form.name}" foi atualizado com sucesso.`);
      } else {
        await createProductMutation.mutateAsync(input);
        success("Produto criado", `"${form.name}" foi adicionado ao catalogo.`);
      }
      setModalOpen(false);
    } catch (e) {
      error("Erro ao salvar", getApiErrorMessage(e));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProductMutation.mutateAsync(id);
      success("Produto removido", "O produto foi excluido do catalogo.");
    } catch (e) {
      error("Erro ao excluir", getApiErrorMessage(e));
    }
  }

  const submitting =
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    deleteProductMutation.isPending;
  const products = productsQuery.data ?? [];
  const loading = productsQuery.isLoading;
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 lg:pl-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestao de Produtos</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Adicione, edite e remova produtos do seu catalogo.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-lg border border-[var(--border)] pl-10 pr-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--muted)]">
          <Package className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-sm mt-1">Adicione produtos para exibir aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar produto" : "Novo produto"}>
        <div className="flex flex-col gap-4">
          <Input
            label="Nome do produto"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Camiseta Verde"
          />
          <div>
            <label className="text-sm text-[var(--muted)] block mb-1">Descricao</label>
            <textarea
              className="w-full rounded-lg border border-[var(--border)] p-2.5 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descricao detalhada do produto..."
            />
          </div>
          <Input
            label="Preco (R$)"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="49.90"
            type="number"
          />
          <Input
            label="URL da imagem (opcional)"
            value={form.image || ""}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {form.image && (
            <div className="mt-2">
              <img src={form.image} alt="preview" className="h-24 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={submitting} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
              {submitting ? "Salvando..." : editing ? "Atualizar" : "Criar produto"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React from "react";

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductType;
  onEdit: (p: ProductType) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="h-40 w-full bg-[var(--secondary)] flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-[var(--muted)] text-sm">Sem imagem</div>
        )}
      </div>
      <div className="p-4">
        <div className="font-semibold text-sm">{product.name}</div>
        <div className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{product.description}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-[var(--accent)]">
            {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 gap-1" onClick={() => onEdit(product)}>
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-red-500 hover:text-red-700" onClick={() => onDelete(product.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}
