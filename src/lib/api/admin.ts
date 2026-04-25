import { api } from "./client";

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type AdminDashboardResponse = {
  metricas: {
    total_lojas_ativas: number;
    total_usuarios: number;
    pedidos_hoje: number;
    receita_total: number;
    total_produtos: number;
    variacao_lojas: string;
    variacao_usuarios: string;
    variacao_pedidos: string;
    variacao_receita: string;
    variacao_produtos: string;
  };
  pedidos_7_dias: Array<{ dia: string; total: number }>;
  top_5_lojas: Array<{ nome: string; receita: number }>;
  atividade_recente: Array<{
    tipo: string;
    descricao: string;
    timestamp: string;
  }>;
};

export type AdminStoreStatus = "Ativa" | "Inativa" | "Pendente" | "Bloqueada";

export type AdminStoreRow = {
  id: string;
  nome: string;
  dono: string;
  email_dono: string;
  status: AdminStoreStatus;
  total_produtos: number;
  total_pedidos: number;
  receita_total: number;
  data_cadastro: string;
};

export type AdminStoreDetails = AdminStoreRow & {
  produtos_recentes?: Array<{
    id: string;
    nome: string;
    preco?: number;
    status?: string;
  }>;
  pedidos_recentes?: Array<{
    id: string;
    cliente?: string;
    valor_total?: number;
    status?: string;
  }>;
};

export type AdminUserType = "Cliente" | "Lojista" | "Admin";
export type AdminUserStatus = "Ativo" | "Inativo" | "Bloqueado" | "Pendente";

export type AdminUserRow = {
  id: string;
  nome: string;
  email: string;
  tipo: AdminUserType;
  status: AdminUserStatus;
  data_cadastro: string;
  ultimo_acesso: string;
};

export type AdminOrderStatus = "Aguardando" | "Em andamento" | "Entregue" | "Cancelado";

export type AdminOrderRow = {
  id: string;
  cliente: string;
  loja: string;
  total_itens: number;
  valor_total: number;
  status: AdminOrderStatus;
  data: string;
};

export type AdminOrderDetails = {
  id: string;
  cliente?: string;
  loja?: string;
  total_itens?: number;
  valor_total?: number;
  status?: string;
  data?: string;
  itens?: Array<{
    id?: string;
    nome?: string;
    quantidade?: number;
    preco?: number;
  }>;
  endereco_entrega?: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  historico_status?: Array<{
    status: string;
    timestamp: string;
  }>;
};

export type AdminCatalogStatus = "Publicado" | "Pausado";

export type AdminCatalogRow = {
  id: string;
  loja: string;
  loja_id: string;
  nome: string;
  categorias: string[];
  total_produtos: number;
  data_atualizacao: string;
  status: AdminCatalogStatus;
};

export type AdminProductStatus = "Ativo" | "Inativo";

export type AdminProductRow = {
  id: string;
  nome: string;
  loja: string;
  loja_id: string;
  categoria: string;
  preco: number;
  estoque: number;
  status: AdminProductStatus;
  imagem_url: string | null;
};

export type ListAdminStoresParams = {
  page?: number;
  limit?: number;
  status?: AdminStoreStatus;
  search?: string;
};

export type ListAdminUsersParams = {
  page?: number;
  limit?: number;
  tipo?: AdminUserType;
  status?: AdminUserStatus;
  search?: string;
};

export type ListAdminOrdersParams = {
  page?: number;
  limit?: number;
  status?: AdminOrderStatus;
  search?: string;
  data_inicio?: string;
  data_fim?: string;
};

export type ListAdminCatalogsParams = {
  search?: string;
  loja_id?: string;
};

export type ListAdminProductsParams = {
  page?: number;
  limit?: number;
  loja_id?: string;
  categoria?: string;
  status?: AdminProductStatus;
  search?: string;
};

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const { data } = await api.get<AdminDashboardResponse>("/admin/dashboard");
  return data;
}

export async function listAdminStores(params: ListAdminStoresParams): Promise<PaginatedResponse<AdminStoreRow>> {
  const { data } = await api.get<PaginatedResponse<AdminStoreRow>>("/admin/lojas", { params });
  return data;
}

export async function getAdminStore(id: string): Promise<AdminStoreDetails> {
  const { data } = await api.get<AdminStoreDetails>(`/admin/lojas/${id}`);
  return data;
}

export async function updateAdminStoreStatus(id: string, status: Exclude<AdminStoreStatus, "Pendente">): Promise<void> {
  await api.patch(`/admin/lojas/${id}/status`, { status });
}

export async function listAdminUsers(params: ListAdminUsersParams): Promise<PaginatedResponse<AdminUserRow>> {
  const { data } = await api.get<PaginatedResponse<AdminUserRow>>("/admin/usuarios", { params });
  return data;
}

export async function updateAdminUserStatus(id: string, status: Exclude<AdminUserStatus, "Pendente">): Promise<void> {
  await api.patch(`/admin/usuarios/${id}/status`, { status });
}

export async function listAdminOrders(params: ListAdminOrdersParams): Promise<PaginatedResponse<AdminOrderRow>> {
  const { data } = await api.get<PaginatedResponse<AdminOrderRow>>("/admin/pedidos", { params });
  return data;
}

export async function getAdminOrder(id: string): Promise<AdminOrderDetails> {
  const { data } = await api.get<AdminOrderDetails>(`/admin/pedidos/${encodeURIComponent(id)}`);
  return data;
}

export async function listAdminCatalogs(params: ListAdminCatalogsParams): Promise<{ data: AdminCatalogRow[]; total: number }> {
  const { data } = await api.get<{ data: AdminCatalogRow[]; total: number }>("/admin/catalogos", { params });
  return data;
}

export async function updateAdminCatalogStatus(id: string, status: AdminCatalogStatus): Promise<void> {
  await api.patch(`/admin/catalogos/${id}/status`, { status });
}

export async function listAdminProducts(params: ListAdminProductsParams): Promise<PaginatedResponse<AdminProductRow>> {
  const { data } = await api.get<PaginatedResponse<AdminProductRow>>("/admin/produtos", { params });
  return data;
}

export async function updateAdminProductStatus(id: string, status: AdminProductStatus): Promise<void> {
  await api.patch(`/admin/produtos/${id}/status`, { status });
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await api.delete(`/admin/produtos/${id}`);
}
