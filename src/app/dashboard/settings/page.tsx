"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Copy, LogOut, Shield, Store as StoreIcon, User as UserIcon } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { clearAuthToken } from "@/lib/auth/storage";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  getStoreAlerts,
  getStorePlan,
  updateStoreColor,
  updateStoreHours,
  updateStoreProfile,
} from "@/lib/api/stores";
import { updateUserProfile } from "@/lib/api/user";
import { uploadAvatar, uploadStoreLogo } from "@/lib/api/uploads";
import { useStore, useStoreProfile } from "@/hooks/useStore";
import type { StoreOpeningHours } from "@/lib/api/types";

const PHONE_REGEX = /^\+[1-9]\d{10,14}$/;
const PRIMARY_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const CEP_REGEX = /^\d{8}$/;
const HOURS_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d$|^fechado$/;
const WEEK_DAYS: Array<keyof StoreOpeningHours> = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

function normalizeOpeningHours(input?: StoreOpeningHours | null): StoreOpeningHours {
  return {
    seg: input?.seg ?? "08:00-18:00",
    ter: input?.ter ?? "08:00-18:00",
    qua: input?.qua ?? "08:00-18:00",
    qui: input?.qui ?? "08:00-18:00",
    sex: input?.sex ?? "08:00-18:00",
    sab: input?.sab ?? "09:00-13:00",
    dom: input?.dom ?? "fechado",
  };
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { clearCart } = useCart();
  const { success, error, info, warning } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const storeQuery = useStore();
  const storeProfileQuery = useStoreProfile();
  const store = storeQuery.data ?? user?.store ?? null;
  const storeId = store?.id;

  const storePlanQuery = useQuery({
    queryKey: ["store", "plan", storeId],
    queryFn: () => getStorePlan(storeId as string),
    enabled: !!storeId,
  });

  const storeAlertsQuery = useQuery({
    queryKey: ["store", "alerts", storeId],
    queryFn: () => getStoreAlerts(storeId as string),
    enabled: !!storeId,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [phoneWhatsapp, setPhoneWhatsapp] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1D9E75");
  const [isOpen, setIsOpen] = useState(true);
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [openingHours, setOpeningHours] = useState<StoreOpeningHours>(() => normalizeOpeningHours());

  const storeUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/catalog/${store?.slug || "minha-loja"}`;
  }, [store?.slug]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAvatarUrl(user.avatarUrl || "");
  }, [user]);

  useEffect(() => {
    const profile = storeProfileQuery.data;
    if (!profile) return;

    setStoreName(profile.name || "");
    setDescription(profile.description || "");
    setLogoUrl(profile.logo_url || "");
    setPhoneWhatsapp(profile.phone_whatsapp || "");
    setPrimaryColor(profile.primary_color || "#1D9E75");
    setIsOpen(Boolean(profile.is_open));
    setLogradouro(profile.address?.logradouro || "");
    setNumero(profile.address?.numero || "");
    setComplemento(profile.address?.complemento || "");
    setBairro(profile.address?.bairro || "");
    setCidade(profile.address?.cidade || "");
    setEstado(profile.address?.estado || "");
    setCep(profile.address?.cep || "");
    setOpeningHours(normalizeOpeningHours(profile.opening_hours));
  }, [storeProfileQuery.data]);

  const updateUserMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      setUser({ ...user, ...updatedUser } as typeof user);
      success("Perfil atualizado", "Seus dados pessoais foram salvos.");
    },
    onError: (err: unknown) => {
      error("Erro ao atualizar perfil", getApiErrorMessage(err));
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      const nextAvatar = data.user?.avatarUrl || data.avatar_url;
      setAvatarUrl(nextAvatar || "");
      if (user) {
        setUser({ ...user, avatarUrl: nextAvatar || user.avatarUrl || null });
      }
      success("Avatar atualizado");
    },
    onError: (err: unknown) => {
      error("Erro no upload do avatar", getApiErrorMessage(err));
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateStoreProfile>[1]) => updateStoreProfile(storeId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["store", "alerts", storeId] });
      success("Perfil da loja atualizado");
    },
    onError: (err: unknown) => {
      error("Erro ao atualizar loja", getApiErrorMessage(err));
    },
  });

  const updateHoursMutation = useMutation({
    mutationFn: () => updateStoreHours(storeId as string, { opening_hours: openingHours }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "profile", "me"] });
      success("Horarios atualizados");
    },
    onError: (err: unknown) => {
      error("Erro ao atualizar horarios", getApiErrorMessage(err));
    },
  });

  const updateColorMutation = useMutation({
    mutationFn: () => updateStoreColor(storeId as string, { primary_color: primaryColor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "profile", "me"] });
      success("Cor primaria atualizada");
    },
    onError: (err: unknown) => {
      error("Erro ao atualizar cor", getApiErrorMessage(err));
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: uploadStoreLogo,
    onSuccess: (data) => {
      setLogoUrl(data.logo_url || "");
      queryClient.invalidateQueries({ queryKey: ["store", "profile", "me"] });
      success("Logo atualizada");
    },
    onError: (err: unknown) => {
      error("Erro no upload da logo", getApiErrorMessage(err));
    },
  });

  function validateHours(): boolean {
    for (const day of WEEK_DAYS) {
      const value = openingHours[day];
      if (!value) continue;
      if (!HOURS_REGEX.test(value)) {
        error("Horario invalido", `Use HH:MM-HH:MM ou fechado para ${day}.`);
        return false;
      }
    }
    return true;
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      error("Email obrigatorio", "Informe seu email.");
      return;
    }
    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
      error("Telefone invalido", "Use o formato internacional, ex: +5585999990000.");
      return;
    }

    updateUserMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      avatar_url: avatarUrl.trim() || undefined,
    });
  }

  function handleSaveStore(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) {
      warning("Loja nao encontrada", "Crie sua loja antes de salvar este perfil.");
      return;
    }
    if (!storeName.trim()) {
      error("Nome da loja obrigatorio", "Informe o nome da loja.");
      return;
    }
    if (phoneWhatsapp.trim() && !PHONE_REGEX.test(phoneWhatsapp.trim())) {
      error("WhatsApp invalido", "Use o formato internacional, ex: +5585999990000.");
      return;
    }
    if (primaryColor.trim() && !PRIMARY_COLOR_REGEX.test(primaryColor.trim())) {
      error("Cor invalida", "Use o formato hexadecimal, ex: #1D9E75.");
      return;
    }
    if (cep.trim() && !CEP_REGEX.test(cep.trim())) {
      error("CEP invalido", "Use 8 digitos, ex: 60000000.");
      return;
    }

    updateStoreMutation.mutate({
      name: storeName.trim(),
      description: description.trim() || undefined,
      logo_url: logoUrl.trim() || undefined,
      phone_whatsapp: phoneWhatsapp.trim() || undefined,
      primary_color: primaryColor.trim() || undefined,
      is_open: isOpen,
      address: {
        logradouro: logradouro.trim() || undefined,
        numero: numero.trim() || undefined,
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim() || undefined,
        cidade: cidade.trim() || undefined,
        estado: estado.trim() || undefined,
        cep: cep.trim() || undefined,
      },
      opening_hours: openingHours,
    });
  }

  function handleSaveHours() {
    if (!storeId) {
      warning("Loja nao encontrada", "Crie sua loja antes de salvar horarios.");
      return;
    }
    if (!validateHours()) return;
    updateHoursMutation.mutate();
  }

  function handleSaveColor() {
    if (!storeId) {
      warning("Loja nao encontrada", "Crie sua loja antes de salvar cor.");
      return;
    }
    if (!PRIMARY_COLOR_REGEX.test(primaryColor.trim())) {
      error("Cor invalida", "Use o formato hexadecimal, ex: #1D9E75.");
      return;
    }
    updateColorMutation.mutate();
  }

  return (
    <div className="p-4 sm:p-8 lg:pl-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Configuracoes</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Gerencie seu perfil, dados da loja e plano ativo.</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h3 className="font-semibold">Perfil pessoal</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            <Input label="Telefone (+5585...)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <label className="text-sm text-[var(--muted)]">Upload de avatar:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatarMutation.mutate(file);
                }}
                className="text-sm"
              />
              <Button type="submit" className="ml-auto bg-[var(--accent)] hover:bg-[var(--accent-hover)]" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Salvando..." : "Salvar perfil"}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <StoreIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Perfil da loja</h3>
          </div>

          {!storeId ? (
            <p className="text-sm text-[var(--muted)]">Nenhuma loja encontrada para esta conta.</p>
          ) : (
            <>
              <form onSubmit={handleSaveStore} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome da loja" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                <Input label="Descricao" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                <Input label="WhatsApp (+5585...)" value={phoneWhatsapp} onChange={(e) => setPhoneWhatsapp(e.target.value)} />
                <div className="md:col-span-2 rounded-xl border border-[var(--border)] p-4 bg-[var(--secondary)]/30">
                  <label className="text-sm text-[var(--muted)] block mb-3">Cor primaria da loja</label>
                  <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
                    <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg border border-[var(--border)]"
                          style={{ backgroundColor: primaryColor }}
                          aria-label="Preview da cor primaria"
                        />
                        <div className="text-sm text-[var(--muted)]">Preview da cor aplicada na loja</div>
                      </div>
                      <Input
                        label="Hexadecimal"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#1D9E75"
                      />
                    </div>
                  </div>
                </div>
                <label className="text-sm text-[var(--muted)] flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
                  Loja aberta
                </label>

                <Input label="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
                <Input label="Numero" value={numero} onChange={(e) => setNumero(e.target.value)} />
                <Input label="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                <Input label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                <Input label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
                <Input label="CEP (8 digitos)" value={cep} onChange={(e) => setCep(e.target.value)} />

                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                  <label className="text-sm text-[var(--muted)]">Upload de logo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadLogoMutation.mutate(file);
                    }}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveColor}
                    disabled={updateColorMutation.isPending}
                  >
                    {updateColorMutation.isPending ? "Salvando cor..." : "Salvar cor"}
                  </Button>
                  <Button
                    type="submit"
                    className="ml-auto bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                    disabled={updateStoreMutation.isPending}
                  >
                    {updateStoreMutation.isPending ? "Salvando..." : "Salvar loja"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 border-t border-[var(--border)] pt-4">
                <h4 className="font-medium mb-3">Horarios de funcionamento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {WEEK_DAYS.map((day) => (
                    <Input
                      key={day}
                      label={day.toUpperCase()}
                      value={openingHours[day] || ""}
                      onChange={(e) => setOpeningHours((prev) => ({ ...prev, [day]: e.target.value }))}
                      placeholder="08:00-18:00 ou fechado"
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button onClick={handleSaveHours} disabled={updateHoursMutation.isPending}>
                    {updateHoursMutation.isPending ? "Salvando horarios..." : "Salvar horarios"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6 space-y-3">
          <h3 className="font-semibold">Plano e alertas</h3>
          <p className="text-sm text-[var(--muted)]">
            Plano: {storePlanQuery.data?.plan?.name || "-"} | Uso: {storePlanQuery.data?.usage?.used_products ?? 0}/
            {storePlanQuery.data?.usage?.max_products ?? 0}
          </p>

          {(storeAlertsQuery.data || []).length === 0 ? (
            <p className="text-sm text-emerald-700">Nenhum alerta ativo.</p>
          ) : (
            <div className="space-y-2">
              {(storeAlertsQuery.data || []).map((alert, idx) => (
                <div key={`${alert.type}-${idx}`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                  <strong>{alert.type}</strong>: {alert.message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white shadow-sm p-6">
          <h3 className="font-semibold mb-3">Link da loja</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={storeUrl}
              className="flex-1 h-10 rounded-lg border border-[var(--border)] px-3 text-sm text-[var(--muted)] bg-[var(--secondary)]"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(storeUrl);
                info("Link copiado!");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-red-600">Zona de perigo</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sair da conta</p>
                <p className="text-xs text-[var(--muted)]">Revogacao do token de acesso.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-red-500"
                onClick={() => {
                  clearAuthToken();
                  setUser(null);
                  router.push("/login");
                  success("Logout realizado com sucesso.");
                }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>

            <div className="border-t border-[var(--border)]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Limpar carrinho</p>
                <p className="text-xs text-[var(--muted)]">Remove todos os itens do carrinho local.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-red-500"
                onClick={() => {
                  clearCart();
                  success("Carrinho limpo.", "Todos os itens foram removidos.");
                }}
              >
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
