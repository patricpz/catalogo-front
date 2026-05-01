"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShoppingCart, ChevronUp, ChevronDown, X, Store,
  MessageCircle, Minus, Plus, Truck, MapPin, ArrowLeft,
  CheckCircle2, Clock, User, Home, Hash,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { Button } from "@/components/ui";
import Skeleton from "@/components/Skeleton";
import { getCatalogBySlug, getStoreProfile } from "@/lib/api/stores";
import { createOrder } from "@/lib/api/orders";
import { getApiErrorMessage } from "@/lib/api/client";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

function getTodayKey(date = new Date()): "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom" {
  const weekKeys = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
  return weekKeys[date.getDay()];
}

function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function isOpenByTodaySchedule(hoursValue?: string | null, now = new Date()): boolean | null {
  if (!hoursValue) return null;

  const normalized = hoursValue.trim().toLowerCase();
  if (normalized === "fechado") return false;

  const parts = normalized.split("-");
  if (parts.length !== 2) return null;

  const start = timeToMinutes(parts[0]);
  const end = timeToMinutes(parts[1]);
  if (start === null || end === null) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (start <= end) {
    return nowMinutes >= start && nowMinutes <= end;
  }

  // Overnight range, e.g., 22:00-02:00.
  return nowMinutes >= start || nowMinutes <= end;
}

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  available: boolean;
};

type DeliveryType = "pickup" | "delivery";

type CheckoutStep = "delivery-type" | "customer-data" | "summary";

interface CustomerData {
  name: string;
  preferredTime: string;
  cep: string;
  street: string;
  neighborhood: string;
  number: string;
  complement: string;
}

const EMPTY_CUSTOMER: CustomerData = {
  name: "",
  preferredTime: "",
  cep: "",
  street: "",
  neighborhood: "",
  number: "",
  complement: "",
};

export default function CatalogSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const [resolvedSlug, setResolvedSlug] = useState("");
  const { addItem, removeItem, updateQuantity, items, totalItems, totalPrice, clearCart } = useCart();
  const { success, error } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  // Checkout flow state
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [customer, setCustomer] = useState<CustomerData>(EMPTY_CUSTOMER);
  const [cepLoading, setCepLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerData, string>>>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const createOrderMutation = useMutation({ mutationFn: createOrder });

  useEffect(() => {
    params.then((p) => setResolvedSlug(p.slug));
  }, [params]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["catalog", resolvedSlug],
    queryFn: () => getCatalogBySlug(resolvedSlug),
    enabled: !!resolvedSlug,
    staleTime: 1000 * 60 * 5,
  });

  const store = data?.store ?? null;
  const products = data?.products ?? [];
  const storeProfileQuery = useQuery({
    queryKey: ["catalog", "store-profile", store?.id],
    queryFn: () => getStoreProfile(store!.id),
    enabled: !!store?.id,
    staleTime: 1000 * 60 * 5,
  });

  const storeProfile = storeProfileQuery.data ?? null;
  const storeName = storeProfile?.name || store?.name || "Loja";
  const storeDescription = storeProfile?.description || store?.description || "";
  const storePrimaryColor = storeProfile?.primary_color || store?.primaryColor || "#1D9E75";
  const storeInitial = store?.name?.trim()?.charAt(0).toUpperCase() || "E";
  const storeLogo = (storeProfile?.logo_url || store?.logoUrl || "").trim();
  const openingHours = storeProfile?.opening_hours || store?.openingHours || null;
  const todayKey = getTodayKey();
  const todayHours = openingHours?.[todayKey] ?? null;
  const isOpenNowBySchedule = isOpenByTodaySchedule(todayHours);
  const isStoreOpen = isOpenNowBySchedule ?? storeProfile?.is_open ?? store?.isOpen ?? true;
  const businessHoursLabel = todayHours
    ? `Hoje (${todayKey}): ${todayHours}`
    : "Funcionamento: Consulte a loja";

  useEffect(() => { setLogoLoadError(false); }, [storeLogo]);

  // Lock body scroll when checkout modal is open
  useEffect(() => {
    if (checkoutStep) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [checkoutStep]);

  function handleAdd(p: CatalogProduct) {
    addItem({ id: p.id, name: p.name, price: p.price, image: p.image ?? undefined });
    setCartOpen(true);
  }

  function openCheckout() {
    setCheckoutStep("delivery-type");
    setDeliveryType(null);
    setCustomer(EMPTY_CUSTOMER);
    setFormErrors({});
    setCartOpen(false);
  }

  function closeCheckout() {
    setCheckoutStep(null);
  }

  function handleDeliveryTypeSelect(type: DeliveryType) {
    setDeliveryType(type);
    setCheckoutStep("customer-data");
    setCustomer(EMPTY_CUSTOMER);
    setFormErrors({});
  }

  async function handleCepBlur(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const json = await res.json() as { erro?: boolean; logradouro?: string; bairro?: string };
      if (!json.erro) {
        setCustomer((prev) => ({
          ...prev,
          street: json.logradouro ?? prev.street,
          neighborhood: json.bairro ?? prev.neighborhood,
        }));
      }
    } catch {
      // silently ignore CEP fetch errors
    } finally {
      setCepLoading(false);
    }
  }

  function validateCustomerData(): boolean {
    const errors: Partial<Record<keyof CustomerData, string>> = {};
    if (!customer.name.trim()) errors.name = "Nome obrigatório";
    if (deliveryType === "pickup") {
      if (!customer.preferredTime.trim()) errors.preferredTime = "Horário obrigatório";
    } else {
      const cepDigits = customer.cep.replace(/\D/g, "");
      if (cepDigits.length !== 8) errors.cep = "CEP inválido";
      if (!customer.street.trim()) errors.street = "Rua obrigatória";
      if (!customer.number.trim()) errors.number = "Número obrigatório";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleCustomerNext() {
    if (validateCustomerData()) {
      setCheckoutStep("summary");
    }
  }

  function buildWhatsAppMessage(): string {
    const lines: string[] = [];
    lines.push(`🛒 *Novo Pedido – ${storeName}*`);
    lines.push("");
    lines.push("*Itens:*");
    items.forEach((it) => {
      lines.push(`• ${it.quantity}x ${it.name} — ${formatPrice(it.price * it.quantity)}`);
    });
    lines.push("");
    lines.push(`*Total:* ${formatPrice(totalPrice)}`);
    lines.push("");
    if (deliveryType === "pickup") {
      lines.push("*Tipo:* Retirada no local");
      if (customer.preferredTime) lines.push(`*Horário preferido:* ${customer.preferredTime}`);
    } else {
      lines.push("*Tipo:* Entrega em domicílio");
      const cepDigits = customer.cep.replace(/\D/g, "");
      const cepFormatted = cepDigits.length === 8 ? `${cepDigits.slice(0, 5)}-${cepDigits.slice(5)}` : customer.cep;
      lines.push(`*Endereço:* ${customer.street}, ${customer.number}${customer.complement ? ` – ${customer.complement}` : ""}`);
      if (customer.neighborhood) lines.push(`*Bairro:* ${customer.neighborhood}`);
      lines.push(`*CEP:* ${cepFormatted}`);
    }
    lines.push("");
    lines.push(`*Cliente:* ${customer.name}`);
    return lines.join("\n");
  }

  async function handleConfirm() {
    let backendWhatsAppLink: string | null = null;
    try {
      const result = await createOrderMutation.mutateAsync({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      backendWhatsAppLink = result.order.whatsappLink;
    } catch (err) {
      error("Nao foi possivel criar o pedido", getApiErrorMessage(err));
      return;
    }

    const phone = (storeProfile?.phone_whatsapp ?? store?.phoneWhatsapp ?? store?.whatsappNumber ?? "").replace(/\D/g, "");
    const message = buildWhatsAppMessage();
    const fallbackUrl = phone
      ? `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(backendWhatsAppLink || fallbackUrl, "_blank");
    clearCart();
    setCheckoutStep(null);
    success("Pedido enviado!", "Você será redirecionado ao WhatsApp.");
  }

  function getProductSku(product: CatalogProduct) {
    return `SKU-${product.id.slice(0, 6).toUpperCase()}`;
  }

  const stepTitles: Record<CheckoutStep, string> = {
    "delivery-type": "Tipo de entrega",
    "customer-data": deliveryType === "pickup" ? "Dados para retirada" : "Dados para entrega",
    "summary": "Resumo do pedido",
  };

  const stepOrder: CheckoutStep[] = ["delivery-type", "customer-data", "summary"];
  const currentStepIndex = checkoutStep ? stepOrder.indexOf(checkoutStep) : -1;

  function handleBack() {
    if (currentStepIndex === 0) closeCheckout();
    else if (currentStepIndex > 0) setCheckoutStep(stepOrder[currentStepIndex - 1]);
  }

  return (
    <div className="min-h-screen bg-[#F7F8F9]">
      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-36">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-20 rounded-xl" />
              ))}
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Skeleton key={item} className="h-64 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <header className="mb-5 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[#EAF7F3]">
                  {storeLogo && !logoLoadError ? (
                    <img
                      src={storeLogo}
                      alt={store?.name || "Logo da loja"}
                      className="h-full w-full object-cover"
                      onError={() => setLogoLoadError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold" style={{ color: storePrimaryColor }}>{storeInitial}</span>
                  )}
                </div>
                <div className="mt-3">
                  <h1 className="text-xl font-semibold text-[var(--foreground)]">{storeName}</h1>
                  {storeDescription && <p className="mt-1 text-sm text-[var(--muted)]">{storeDescription}</p>}
                  <p className="mt-1 text-sm text-[var(--muted)]">{businessHoursLabel}</p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isStoreOpen ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isStoreOpen ? "Aberto agora" : "Fechado agora"}
                  </span>
                </div>
              </div>
            </header>

            <section>
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-10 text-[var(--muted)]">
                  <Store className="mb-2 h-10 w-10 opacity-20" />
                  <p className="text-sm">Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
                  {products.map((product) => {
                    const inStock = product.available;
                    return (
                      <article
                        key={product.id}
                        className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition-transform hover:-translate-y-0.5"
                        onClick={() => handleAdd(product)}
                      >
                        <div className="relative aspect-square border-b border-[var(--border)] bg-[#F1F3F4]">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Store className="h-8 w-8 text-slate-300" />
                            </div>
                          )}
                          <button
                            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md"
                            style={{ backgroundColor: storePrimaryColor }}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAdd(product);
                            }}
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex flex-1 flex-col p-3">
                          <h3 className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">{product.name}</h3>
                          <p className="mt-1 text-xs text-[var(--muted)]">{getProductSku(product)}</p>
                          <span className="mt-2 text-xl font-bold text-[var(--foreground)]">{formatPrice(product.price)}</span>
                          <span
                            className={`mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                              inStock ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {inStock ? "Em estoque" : "Estoque baixo"}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ── Cart Drawer ── */}
      {totalItems > 0 && (
        <aside
          className={`fixed bottom-0 left-0 z-50 w-full bg-white border-t border-[var(--border)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 sm:rounded-2xl sm:border sm:shadow-xl ${
            cartOpen ? "translate-y-0" : "translate-y-[calc(100%-72px)]"
          }`}
        >
          <div
            className="flex items-center justify-between p-4 cursor-pointer select-none active:bg-gray-50 transition-colors"
            onClick={() => setCartOpen(!cartOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-[var(--foreground)]" />
                <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <h3 className="text-base font-semibold">Seu Carrinho</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-[var(--foreground)] sm:hidden">
                {formatPrice(totalPrice)}
              </span>
              <div className="bg-[var(--secondary)] rounded-full p-1">
                {cartOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="space-y-3 max-h-[40vh] sm:max-h-60 overflow-y-auto mb-4 hide-scrollbar">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 bg-[var(--secondary)] p-3 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-[var(--foreground)]">{it.name}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{formatPrice(it.price * it.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-white rounded-lg border p-1 shadow-sm">
                    <button
                      onClick={(e) => { e.stopPropagation(); updateQuantity(it.id, it.quantity - 1); }}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-[var(--foreground)] active:bg-gray-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">{it.quantity}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateQuantity(it.id, it.quantity + 1); }}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-[var(--foreground)] active:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(it.id); }}
                    className="text-[var(--muted)] hover:text-red-500 p-2 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] pt-4 pb-2">
              <div className="hidden sm:flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--muted)]">Total</span>
                <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
              </div>
              <Button
                onClick={(e) => { e.stopPropagation(); openCheckout(); }}
                className="w-full h-12 text-base font-medium shadow-md gap-2 text-white rounded-xl"
                style={{ backgroundColor: storePrimaryColor }}
              >
                <CheckCircle2 className="h-5 w-5" />
                Finalizar pedido
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* ── Checkout Overlay ── */}
      {checkoutStep && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === overlayRef.current) closeCheckout(); }}
        >
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]">
            {/* Modal header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[var(--border)] shrink-0">
              <button
                onClick={handleBack}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--secondary)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--muted)]">
                  Etapa {currentStepIndex + 1} de {stepOrder.length}
                </p>
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  {stepTitles[checkoutStep]}
                </h2>
              </div>
              <button
                onClick={closeCheckout}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-[var(--secondary)] shrink-0">
              <div
                className="h-full bg-[#1D9E75] transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / stepOrder.length) * 100}%`, backgroundColor: storePrimaryColor }}
              />
            </div>

            {/* Step content */}
            <div className="overflow-y-auto flex-1 px-5 py-5">

              {/* ── Step 1: Delivery type ── */}
              {checkoutStep === "delivery-type" && (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted)] mb-4">
                    Como você prefere receber seu pedido?
                  </p>
                  <button
                    onClick={() => handleDeliveryTypeSelect("pickup")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[var(--border)] hover:bg-[#EAF7F3] transition-all text-left group"
                    style={{ borderColor: deliveryType === "pickup" ? storePrimaryColor : undefined }}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF7F3] transition-colors">
                      <MapPin className="h-6 w-6 transition-colors" style={{ color: storePrimaryColor }} />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">Retirada no local</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Retire seu pedido diretamente na loja</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeliveryTypeSelect("delivery")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[var(--border)] hover:bg-[#EAF7F3] transition-all text-left group"
                    style={{ borderColor: deliveryType === "delivery" ? storePrimaryColor : undefined }}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF7F3] transition-colors">
                      <Truck className="h-6 w-6 transition-colors" style={{ color: storePrimaryColor }} />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">Entrega em domicílio</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Receba o pedido no seu endereço</p>
                    </div>
                  </button>
                </div>
              )}

              {/* ── Step 2: Customer data ── */}
              {checkoutStep === "customer-data" && (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground)] mb-1.5">
                      <User className="h-3.5 w-3.5" /> Nome completo
                    </label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={customer.name}
                      onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 ${formErrors.name ? "border-red-400" : "border-[var(--border)]"}`}
                    />
                    {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                  </div>

                  {deliveryType === "pickup" ? (
                    // Pickup: preferred time
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground)] mb-1.5">
                        <Clock className="h-3.5 w-3.5" /> Horário preferido para retirada
                      </label>
                      <input
                        type="time"
                        value={customer.preferredTime}
                        onChange={(e) => setCustomer((p) => ({ ...p, preferredTime: e.target.value }))}
                        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 ${formErrors.preferredTime ? "border-red-400" : "border-[var(--border)]"}`}
                      />
                      {formErrors.preferredTime && <p className="mt-1 text-xs text-red-500">{formErrors.preferredTime}</p>}
                    </div>
                  ) : (
                    // Delivery: address fields
                    <>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground)] mb-1.5">
                          <Hash className="h-3.5 w-3.5" /> CEP
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="00000-000"
                            value={customer.cep}
                            onChange={(e) => setCustomer((p) => ({ ...p, cep: formatCep(e.target.value) }))}
                            onBlur={(e) => void handleCepBlur(e.target.value)}
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 ${formErrors.cep ? "border-red-400" : "border-[var(--border)]"}`}
                          />
                          {cepLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="h-4 w-4 rounded-full border-2 border-[#1D9E75] border-t-transparent animate-spin" />
                            </div>
                          )}
                        </div>
                        {formErrors.cep && <p className="mt-1 text-xs text-red-500">{formErrors.cep}</p>}
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground)] mb-1.5">
                          <Home className="h-3.5 w-3.5" /> Rua / Logradouro
                        </label>
                        <input
                          type="text"
                          placeholder="Nome da rua"
                          value={customer.street}
                          onChange={(e) => setCustomer((p) => ({ ...p, street: e.target.value }))}
                          className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 ${formErrors.street ? "border-red-400" : "border-[var(--border)]"}`}
                        />
                        {formErrors.street && <p className="mt-1 text-xs text-red-500">{formErrors.street}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[var(--foreground)] mb-1.5 block">Número</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={customer.number}
                            onChange={(e) => setCustomer((p) => ({ ...p, number: e.target.value }))}
                            className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 ${formErrors.number ? "border-red-400" : "border-[var(--border)]"}`}
                          />
                          {formErrors.number && <p className="mt-1 text-xs text-red-500">{formErrors.number}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[var(--foreground)] mb-1.5 block">Complemento</label>
                          <input
                            type="text"
                            placeholder="Apto, bloco..."
                            value={customer.complement}
                            onChange={(e) => setCustomer((p) => ({ ...p, complement: e.target.value }))}
                            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--foreground)] mb-1.5 block">Bairro</label>
                        <input
                          type="text"
                          placeholder="Nome do bairro"
                          value={customer.neighborhood}
                          onChange={(e) => setCustomer((p) => ({ ...p, neighborhood: e.target.value }))}
                          className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Step 3: Summary ── */}
              {checkoutStep === "summary" && (
                <div className="space-y-4">
                  {/* Items */}
                  <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                    <div className="bg-[var(--secondary)] px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Itens do pedido</p>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {items.map((it) => (
                        <div key={it.id} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-[var(--foreground)]">
                            <span className="font-medium">{it.quantity}x</span> {it.name}
                          </span>
                          <span className="text-sm font-semibold">{formatPrice(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-[#EAF7F3] px-4 py-3">
                      <span className="text-sm font-semibold text-[var(--foreground)]">Total</span>
                      <span className="text-lg font-bold text-[#1D9E75]">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Delivery info */}
                  <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                    <div className="bg-[var(--secondary)] px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Entrega</p>
                    </div>
                    <div className="px-4 py-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        {deliveryType === "pickup"
                          ? <MapPin className="h-4 w-4 text-[#1D9E75] shrink-0" />
                          : <Truck className="h-4 w-4 text-[#1D9E75] shrink-0" />}
                        <span className="text-sm font-medium">
                          {deliveryType === "pickup" ? "Retirada no local" : "Entrega em domicílio"}
                        </span>
                      </div>
                      {deliveryType === "pickup" && customer.preferredTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--muted)] shrink-0" />
                          <span className="text-sm text-[var(--muted)]">Horário: {customer.preferredTime}</span>
                        </div>
                      )}
                      {deliveryType === "delivery" && (
                        <div className="flex items-start gap-2">
                          <Home className="h-4 w-4 text-[var(--muted)] shrink-0 mt-0.5" />
                          <span className="text-sm text-[var(--muted)]">
                            {customer.street}, {customer.number}
                            {customer.complement ? ` – ${customer.complement}` : ""}
                            {customer.neighborhood ? `, ${customer.neighborhood}` : ""}
                            {" · CEP "}{customer.cep}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                    <div className="bg-[var(--secondary)] px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Cliente</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3">
                      <User className="h-4 w-4 text-[var(--muted)] shrink-0" />
                      <span className="text-sm">{customer.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-[var(--border)] shrink-0">
              {checkoutStep === "customer-data" && (
                <Button
                  onClick={handleCustomerNext}
                  className="w-full h-12 text-base font-medium gap-2 text-white rounded-xl"
                  style={{ backgroundColor: storePrimaryColor }}
                >
                  Continuar
                </Button>
              )}
              {checkoutStep === "summary" && (
                <Button
                  onClick={() => void handleConfirm()}
                  disabled={createOrderMutation.isPending}
                  className="w-full h-12 text-base font-medium gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl shadow-md"
                >
                  <MessageCircle className="h-5 w-5" />
                  {createOrderMutation.isPending ? "Processando..." : "Confirmar e enviar pelo WhatsApp"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
