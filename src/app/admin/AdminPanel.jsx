'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/toast-context';
import { clearAuthToken } from '@/lib/auth/storage';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  deleteAdminProduct,
  getAdminDashboard,
  getAdminOrder,
  getAdminStore,
  listAdminCatalogs,
  listAdminOrders,
  listAdminProducts,
  listAdminStores,
  listAdminUsers,
  updateAdminCatalogStatus,
  updateAdminProductStatus,
  updateAdminStoreStatus,
  updateAdminUserStatus,
} from '@/lib/api/admin';

const STATUS_STYLES = {
  ativa: { bg: '#dcfce7', color: '#166534' },
  ativo: { bg: '#dcfce7', color: '#166534' },
  inativa: { bg: '#f1f5f9', color: '#475569' },
  inativo: { bg: '#f1f5f9', color: '#475569' },
  pendente: { bg: '#fef9c3', color: '#854d0e' },
  bloqueada: { bg: '#fee2e2', color: '#b91c1c' },
  bloqueado: { bg: '#fee2e2', color: '#b91c1c' },
  cancelado: { bg: '#fee2e2', color: '#b91c1c' },
  andamento: { bg: '#dbeafe', color: '#1d4ed8' },
  aguardando: { bg: '#fef9c3', color: '#854d0e' },
  entregue: { bg: '#dcfce7', color: '#166534' },
  publicado: { bg: '#dcfce7', color: '#166534' },
  pausado: { bg: '#f1f5f9', color: '#475569' },
  cliente: { bg: '#ecfeff', color: '#0f766e' },
  lojista: { bg: '#dcfce7', color: '#166534' },
  admin: { bg: '#dbeafe', color: '#1d4ed8' },
};

function statusBadge(status) {
  const key = String(status || '').toLowerCase();
  const style = STATUS_STYLES[key] || { bg: '#f1f5f9', color: '#334155' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        border: '1px solid rgba(15,23,42,.08)',
        textTransform: 'capitalize',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: style.color,
          display: 'inline-block',
        }}
      />
      {status}
    </span>
  );
}

function filterTable(query, data) {
  if (!query) return data;
  const normalized = String(query).toLowerCase().trim();
  if (!normalized) return data;

  return data.filter((item) => {
    const value = Object.values(item)
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .join(' ')
      .toLowerCase();
    return value.includes(normalized);
  });
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar modal">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function Pagination({ total, perPage, currentPage, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination-wrap">
      <span className="pagination-info">
        Mostrando {total === 0 ? 0 : (currentPage - 1) * perPage + 1} a {Math.min(currentPage * perPage, total)} de {total}
      </span>
      <div className="pagination-buttons">
        {pages.map((page) => (
          <button
            key={page}
            className={page === currentPage ? 'page-btn active' : 'page-btn'}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'lojas', label: 'Lojas' },
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'pedidos', label: 'Pedidos' },
  { key: 'catalogos', label: 'Catalogos' },
  { key: 'produtos', label: 'Produtos' },
];

function currency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '-';
  if (String(value).includes('/')) return String(value);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatRelative(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '-');

  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `ha ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `ha ${hours} h`;
  const days = Math.floor(hours / 24);
  return `ha ${days} dias`;
}

function iconFor(key) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (key === 'dashboard') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </svg>
    );
  }

  if (key === 'lojas') {
    return (
      <svg {...common}>
        <path d="M3 9h18" />
        <path d="M5 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
        <path d="M4 9l1 10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l1-10" />
      </svg>
    );
  }

  if (key === 'usuarios') {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (key === 'pedidos') {
    return (
      <svg {...common}>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    );
  }

  if (key === 'catalogos') {
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const toast = useToast();

  const [section, setSection] = useState('dashboard');
  const [topSearch, setTopSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [dashboard, setDashboard] = useState(null);

  const [stores, setStores] = useState([]);
  const [storesTotal, setStoresTotal] = useState(0);
  const [storeQuery, setStoreQuery] = useState('');
  const [storeStatus, setStoreStatus] = useState('Todos');
  const [storePage, setStorePage] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeDetails, setStoreDetails] = useState(null);
  const [storeDetailsLoading, setStoreDetailsLoading] = useState(false);
  const [storeOptions, setStoreOptions] = useState([]);

  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [userType, setUserType] = useState('Todos');
  const [userStatus, setUserStatus] = useState('Todos');
  const [userPage, setUserPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatus, setOrderStatus] = useState('Todos');
  const [orderPage, setOrderPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  const [catalogs, setCatalogs] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogStoreId, setCatalogStoreId] = useState('Todas');

  const [products, setProducts] = useState([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productQuery, setProductQuery] = useState('');
  const [productStatus, setProductStatus] = useState('Todos');
  const [productView, setProductView] = useState('grid');
  const [productPage, setProductPage] = useState(1);

  const [loading, setLoading] = useState({
    dashboard: false,
    lojas: false,
    usuarios: false,
    pedidos: false,
    catalogos: false,
    produtos: false,
  });

  const storesSearch = useDebouncedValue((storeQuery || topSearch).trim(), 350);
  const usersSearch = useDebouncedValue((userQuery || topSearch).trim(), 350);
  const ordersSearch = useDebouncedValue((orderQuery || topSearch).trim(), 350);
  const catalogsSearch = useDebouncedValue((catalogQuery || topSearch).trim(), 350);
  const productsSearch = useDebouncedValue((productQuery || topSearch).trim(), 350);

  const handleRequestError = useCallback(
    (error, fallbackTitle) => {
      const status = error?.response?.status;

      if (status === 401) {
        clearAuthToken();
        toast.error('Sessao expirada', 'Faca login novamente para continuar.');
        router.push('/login');
        return;
      }

      if (status === 403) {
        toast.error('Acesso negado', 'Seu usuario nao possui permissao de administrador.');
        setErrorMessage('Acesso negado: sua conta nao possui permissao de administrador.');
        return;
      }

      const msg = getApiErrorMessage(error);
      toast.error(fallbackTitle, msg);
      setErrorMessage(msg);
    },
    [router, toast]
  );

  const fetchDashboard = useCallback(async () => {
    setLoading((prev) => ({ ...prev, dashboard: true }));
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
      setErrorMessage('');
    } catch (error) {
      handleRequestError(error, 'Falha ao carregar dashboard');
    } finally {
      setLoading((prev) => ({ ...prev, dashboard: false }));
    }
  }, [handleRequestError]);

  const fetchStoreOptions = useCallback(async () => {
    try {
      const response = await listAdminStores({ page: 1, limit: 100 });
      setStoreOptions(response.data.map((store) => ({ id: store.id, nome: store.nome })));
    } catch {
      // Silencioso: dropdown de lojas e opcional para catalogos.
    }
  }, []);

  const fetchStores = useCallback(async () => {
    setLoading((prev) => ({ ...prev, lojas: true }));
    try {
      const response = await listAdminStores({
        page: storePage,
        limit: 10,
        search: storesSearch || undefined,
        status: storeStatus === 'Todos' ? undefined : storeStatus,
      });
      setStores(response.data);
      setStoresTotal(response.total);
      setErrorMessage('');
    } catch (error) {
      handleRequestError(error, 'Falha ao carregar lojas');
    } finally {
      setLoading((prev) => ({ ...prev, lojas: false }));
    }
  }, [handleRequestError, storePage, storeStatus, storesSearch]);

  const fetchUsers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, usuarios: true }));
    try {
      const response = await listAdminUsers({
        page: userPage,
        limit: 10,
        search: usersSearch || undefined,
        tipo: userType === 'Todos' ? undefined : userType,
        status: userStatus === 'Todos' ? undefined : userStatus,
      });
      setUsers(response.data);
      setUsersTotal(response.total);
      setErrorMessage('');
    } catch (error) {
      handleRequestError(error, 'Falha ao carregar usuarios');
    } finally {
      setLoading((prev) => ({ ...prev, usuarios: false }));
    }
  }, [handleRequestError, userPage, userStatus, userType, usersSearch]);

  const fetchOrders = useCallback(async () => {
    setLoading((prev) => ({ ...prev, pedidos: true }));
    try {
      const response = await listAdminOrders({
        page: orderPage,
        limit: 10,
        search: ordersSearch || undefined,
        status: orderStatus === 'Todos' ? undefined : orderStatus,
      });
      setOrders(response.data);
      setOrdersTotal(response.total);
      setErrorMessage('');
    } catch (error) {
      handleRequestError(error, 'Falha ao carregar pedidos');
    } finally {
      setLoading((prev) => ({ ...prev, pedidos: false }));
    }
  }, [handleRequestError, orderPage, orderStatus, ordersSearch]);

  const fetchCatalogs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, catalogos: true }));
    try {
      const response = await listAdminCatalogs({
        search: catalogsSearch || undefined,
        loja_id: catalogStoreId === 'Todas' ? undefined : catalogStoreId,
      });
      setCatalogs(response.data);
      setCatalogTotal(response.total);
      setErrorMessage('');
    } catch (error) {
      handleRequestError(error, 'Falha ao carregar catalogos');
    } finally {
      setLoading((prev) => ({ ...prev, catalogos: false }));
    }
  }, [catalogStoreId, catalogsSearch, handleRequestError]);

  const fetchProducts = useCallback(async () => {
    setLoading((prev) => ({ ...prev, produtos: true }));
    try {
      const response = await listAdminProducts({
        page: productPage,
        limit: 20,
        search: productsSearch || undefined,
        status: productStatus === 'Todos' ? undefined : productStatus,
      });
      setProducts(response.data);
      setProductsTotal(response.total);
      setErrorMessage('');
    } catch (error) {
      handleRequestError(error, 'Falha ao carregar produtos');
    } finally {
      setLoading((prev) => ({ ...prev, produtos: false }));
    }
  }, [handleRequestError, productPage, productStatus, productsSearch]);

  useEffect(() => {
    fetchStoreOptions();
  }, [fetchStoreOptions]);

  useEffect(() => {
    if (section === 'dashboard') fetchDashboard();
  }, [fetchDashboard, section]);

  useEffect(() => {
    if (section === 'lojas') fetchStores();
  }, [fetchStores, section]);

  useEffect(() => {
    if (section === 'usuarios') fetchUsers();
  }, [fetchUsers, section]);

  useEffect(() => {
    if (section === 'pedidos') fetchOrders();
  }, [fetchOrders, section]);

  useEffect(() => {
    if (section === 'catalogos') fetchCatalogs();
  }, [fetchCatalogs, section]);

  useEffect(() => {
    if (section === 'produtos') fetchProducts();
  }, [fetchProducts, section]);

  const navCounts = {
    dashboard: 0,
    lojas: storesTotal,
    usuarios: usersTotal,
    pedidos: orders.filter((o) => o.status === 'Aguardando').length,
    catalogos: catalogTotal,
    produtos: productsTotal,
  };

  const metrics = useMemo(() => {
    if (!dashboard?.metricas) {
      return [
        { label: 'Lojas Ativas', value: 0, delta: '+0 este mes', positive: true },
        { label: 'Usuarios', value: 0, delta: '+0 este mes', positive: true },
        { label: 'Pedidos Hoje', value: 0, delta: '+0 este mes', positive: true },
        { label: 'Receita Total', value: currency(0), delta: '+0 este mes', positive: true },
        { label: 'Total de Produtos', value: 0, delta: '+0 este mes', positive: true },
      ];
    }

    const m = dashboard.metricas;
    const asMetric = (label, value, delta) => ({
      label,
      value,
      delta,
      positive: !String(delta || '').trim().startsWith('-'),
    });

    return [
      asMetric('Lojas Ativas', m.total_lojas_ativas, m.variacao_lojas),
      asMetric('Usuarios', m.total_usuarios, m.variacao_usuarios),
      asMetric('Pedidos Hoje', m.pedidos_hoje, m.variacao_pedidos),
      asMetric('Receita Total', currency(m.receita_total), m.variacao_receita),
      asMetric('Total de Produtos', m.total_produtos, m.variacao_produtos),
    ];
  }, [dashboard]);

  const topStores = useMemo(() => filterTable(topSearch, dashboard?.top_5_lojas || []), [dashboard, topSearch]);
  const activity = useMemo(() => filterTable(topSearch, dashboard?.atividade_recente || []), [dashboard, topSearch]);

  async function openStoreDetails(store) {
    setSelectedStore(store);
    setStoreDetails(null);
    setStoreDetailsLoading(true);
    try {
      const details = await getAdminStore(store.id);
      setStoreDetails(details);
    } catch (error) {
      handleRequestError(error, 'Falha ao carregar detalhes da loja');
    } finally {
      setStoreDetailsLoading(false);
    }
  }

  async function toggleStoreStatus(store) {
    const nextStatus = store.status === 'Bloqueada' ? 'Ativa' : 'Bloqueada';
    const confirmLabel = nextStatus === 'Ativa' ? 'ativar' : 'bloquear';
    if (!window.confirm(`Deseja ${confirmLabel} a loja ${store.nome}?`)) return;

    try {
      await updateAdminStoreStatus(store.id, nextStatus);
      toast.success('Status da loja atualizado');
      fetchStores();
      if (selectedStore?.id === store.id) {
        setSelectedStore({ ...selectedStore, status: nextStatus });
      }
    } catch (error) {
      handleRequestError(error, 'Nao foi possivel atualizar o status da loja');
    }
  }

  async function toggleUserStatus(user) {
    const nextStatus = user.status === 'Bloqueado' ? 'Ativo' : 'Bloqueado';
    const confirmLabel = nextStatus === 'Ativo' ? 'desbloquear' : 'bloquear';
    if (!window.confirm(`Deseja ${confirmLabel} o usuario ${user.nome}?`)) return;

    try {
      await updateAdminUserStatus(user.id, nextStatus);
      toast.success('Status do usuario atualizado');
      fetchUsers();
    } catch (error) {
      handleRequestError(error, 'Nao foi possivel atualizar o usuario');
    }
  }

  async function openOrderDetails(order) {
    setSelectedOrder(null);
    setOrderDetailsLoading(true);
    try {
      const details = await getAdminOrder(order.id);
      setSelectedOrder(details);
    } catch (error) {
      handleRequestError(error, 'Falha ao carregar detalhes do pedido');
    } finally {
      setOrderDetailsLoading(false);
    }
  }

  async function toggleCatalogStatus(catalog) {
    const nextStatus = catalog.status === 'Publicado' ? 'Pausado' : 'Publicado';
    if (!window.confirm(`Deseja alterar o status do catalogo ${catalog.nome}?`)) return;

    try {
      await updateAdminCatalogStatus(catalog.id, nextStatus);
      toast.success('Status do catalogo atualizado');
      fetchCatalogs();
    } catch (error) {
      handleRequestError(error, 'Nao foi possivel atualizar o catalogo');
    }
  }

  async function toggleProductStatus(product) {
    const nextStatus = product.status === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      await updateAdminProductStatus(product.id, nextStatus);
      toast.success('Status do produto atualizado');
      fetchProducts();
    } catch (error) {
      handleRequestError(error, 'Nao foi possivel atualizar o produto');
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Deseja remover o produto ${product.nome}? Essa acao nao pode ser desfeita.`)) return;

    try {
      await deleteAdminProduct(product.id);
      toast.success('Produto removido com sucesso');
      fetchProducts();
    } catch (error) {
      handleRequestError(error, 'Nao foi possivel remover o produto');
    }
  }

  function renderLoadingRow(colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
          Carregando...
        </td>
      </tr>
    );
  }

  function renderDashboard() {
    const chartData = dashboard?.pedidos_7_dias || [];
    const max = Math.max(...chartData.map((d) => d.total), 1);

    return (
      <div className="section-stack">
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <div className="card metric-card" key={metric.label}>
              <span className="metric-label">{metric.label}</span>
              <strong className="metric-value">{metric.value}</strong>
              <span className={metric.positive ? 'metric-delta positive' : 'metric-delta negative'}>
                {metric.positive ? '↑' : '↓'} {metric.delta}
              </span>
            </div>
          ))}
        </div>

        <div className="dual-grid">
          <div className="card">
            <h3>Pedidos dos ultimos 7 dias</h3>
            <div className="chart-wrap">
              {loading.dashboard ? (
                <div style={{ color: '#64748b' }}>Carregando grafico...</div>
              ) : (
                chartData.map((item) => (
                  <div className="bar-col" key={item.dia}>
                    <div
                      className="bar"
                      title={`${item.total} pedidos`}
                      style={{ height: `${Math.max(12, (item.total / max) * 180)}px` }}
                    />
                    <span>{item.dia}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h3>Top 5 Lojas</h3>
            <ul className="rank-list">
              {topStores.map((store, index) => (
                <li key={`${store.nome}-${index}`}>
                  <div>
                    <strong>{index + 1}. {store.nome}</strong>
                  </div>
                  <span>{currency(store.receita)}</span>
                </li>
              ))}
              {topStores.length === 0 ? <li>Nenhuma loja encontrada.</li> : null}
            </ul>
          </div>
        </div>

        <div className="card">
          <h3>Atividade Recente</h3>
          <ul className="activity-list">
            {activity.map((item, i) => (
              <li key={`${item.tipo}-${i}`}>
                <span className="activity-dot" style={{ background: '#16a34a' }} />
                <span className="activity-text">{item.descricao || item.tipo}</span>
                <span className="activity-time">{formatRelative(item.timestamp)}</span>
              </li>
            ))}
            {activity.length === 0 ? <li>Sem atividade recente.</li> : null}
          </ul>
        </div>
      </div>
    );
  }

  function renderStores() {
    return (
      <div className="section-stack">
        <div className="toolbar card">
          <input
            className="field"
            placeholder="Buscar loja..."
            value={storeQuery}
            onChange={(e) => {
              setStorePage(1);
              setStoreQuery(e.target.value);
            }}
          />
          <select
            className="field"
            value={storeStatus}
            onChange={(e) => {
              setStorePage(1);
              setStoreStatus(e.target.value);
            }}
          >
            <option>Todos</option>
            <option>Ativa</option>
            <option>Inativa</option>
            <option>Pendente</option>
            <option>Bloqueada</option>
          </select>
          <button className="primary-btn" type="button" onClick={() => toast.info('Criacao de loja', 'Use o fluxo de cadastro no backend.')}>Nova Loja</button>
        </div>

        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Loja</th>
                <th>Dono</th>
                <th>Status</th>
                <th>Produtos</th>
                <th>Pedidos</th>
                <th>Cadastro</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading.lojas ? renderLoadingRow(7) : null}
              {!loading.lojas && stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.nome}</td>
                  <td>{store.dono}</td>
                  <td>{statusBadge(store.status)}</td>
                  <td>{store.total_produtos}</td>
                  <td>{store.total_pedidos}</td>
                  <td>{formatDate(store.data_cadastro)}</td>
                  <td>
                    <div className="actions-row">
                      <button className="ghost-btn" onClick={() => openStoreDetails(store)} type="button">Ver</button>
                      <button className="ghost-btn" onClick={() => toggleStoreStatus(store)} type="button">
                        {store.status === 'Bloqueada' ? 'Ativar' : 'Bloquear'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading.lojas && stores.length === 0 ? renderLoadingRow(7) : null}
            </tbody>
          </table>

          <Pagination
            total={storesTotal}
            perPage={10}
            currentPage={storePage}
            onPageChange={setStorePage}
          />
        </div>

        <Modal
          open={Boolean(selectedStore)}
          title={selectedStore ? `Detalhes: ${selectedStore.nome}` : ''}
          onClose={() => {
            setSelectedStore(null);
            setStoreDetails(null);
          }}
          footer={
            <>
              <button className="ghost-btn" onClick={() => setSelectedStore(null)} type="button">Fechar</button>
              {selectedStore ? (
                <button className="primary-btn" onClick={() => toggleStoreStatus(selectedStore)} type="button">
                  {selectedStore.status === 'Bloqueada' ? 'Ativar Loja' : 'Bloquear Loja'}
                </button>
              ) : null}
            </>
          }
        >
          {storeDetailsLoading ? <p>Carregando detalhes...</p> : null}
          {!storeDetailsLoading && storeDetails ? (
            <div className="modal-content-grid">
              <div>
                <p><strong>Dono:</strong> {storeDetails.dono}</p>
                <p><strong>Email:</strong> {storeDetails.email_dono}</p>
                <p><strong>Status:</strong> {storeDetails.status}</p>
                <p><strong>Produtos:</strong> {storeDetails.total_produtos}</p>
                <p><strong>Pedidos:</strong> {storeDetails.total_pedidos}</p>
                <p><strong>Receita:</strong> {currency(storeDetails.receita_total)}</p>
                <p><strong>Cadastro:</strong> {formatDate(storeDetails.data_cadastro)}</p>
              </div>
              <div>
                <strong>Produtos recentes</strong>
                <ul className="mini-list" style={{ marginTop: 8, marginBottom: 16 }}>
                  {(storeDetails.produtos_recentes || []).map((product) => (
                    <li key={product.id || product.nome}>
                      <span>{product.nome || 'Produto'}</span>
                      <span>{product.preco != null ? currency(product.preco) : '-'}</span>
                    </li>
                  ))}
                  {(storeDetails.produtos_recentes || []).length === 0 ? <li>Sem produtos recentes.</li> : null}
                </ul>
                <strong>Pedidos recentes</strong>
                <ul className="mini-list" style={{ marginTop: 8 }}>
                  {(storeDetails.pedidos_recentes || []).map((order) => (
                    <li key={order.id || String(Math.random())}>
                      <span>{order.id || 'Pedido'}</span>
                      <span>{order.valor_total != null ? currency(order.valor_total) : '-'}</span>
                    </li>
                  ))}
                  {(storeDetails.pedidos_recentes || []).length === 0 ? <li>Sem pedidos recentes.</li> : null}
                </ul>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    );
  }

  function renderUsers() {
    return (
      <div className="section-stack">
        <div className="toolbar card">
          <input
            className="field"
            placeholder="Buscar por nome ou email..."
            value={userQuery}
            onChange={(e) => {
              setUserPage(1);
              setUserQuery(e.target.value);
            }}
          />
          <select className="field" value={userType} onChange={(e) => { setUserPage(1); setUserType(e.target.value); }}>
            <option>Todos</option>
            <option>Cliente</option>
            <option>Lojista</option>
            <option>Admin</option>
          </select>
          <select className="field" value={userStatus} onChange={(e) => { setUserPage(1); setUserStatus(e.target.value); }}>
            <option>Todos</option>
            <option>Ativo</option>
            <option>Inativo</option>
            <option>Pendente</option>
            <option>Bloqueado</option>
          </select>
        </div>

        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Ultimo Acesso</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading.usuarios ? renderLoadingRow(7) : null}
              {!loading.usuarios && users.map((user) => (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{statusBadge(user.tipo)}</td>
                  <td>{statusBadge(user.status)}</td>
                  <td>{formatDate(user.data_cadastro)}</td>
                  <td>{user.ultimo_acesso}</td>
                  <td>
                    <div className="actions-row">
                      <button className="ghost-btn" type="button" onClick={() => toast.info('Perfil', `${user.nome} - ${user.email}`)}>Ver perfil</button>
                      <button className="ghost-btn" type="button" onClick={() => toggleUserStatus(user)}>
                        {user.status === 'Bloqueado' ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading.usuarios && users.length === 0 ? renderLoadingRow(7) : null}
            </tbody>
          </table>
          <Pagination
            total={usersTotal}
            perPage={10}
            currentPage={userPage}
            onPageChange={setUserPage}
          />
        </div>
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="section-stack">
        <div className="toolbar card">
          <input
            className="field"
            placeholder="Buscar por ID ou cliente..."
            value={orderQuery}
            onChange={(e) => {
              setOrderPage(1);
              setOrderQuery(e.target.value);
            }}
          />
          <select className="field" value={orderStatus} onChange={(e) => { setOrderPage(1); setOrderStatus(e.target.value); }}>
            <option>Todos</option>
            <option>Aguardando</option>
            <option>Em andamento</option>
            <option>Entregue</option>
            <option>Cancelado</option>
          </select>
        </div>

        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Loja</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Data</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading.pedidos ? renderLoadingRow(8) : null}
              {!loading.pedidos && orders.map((order) => (
                <tr key={order.id}>
                  <td><code>{order.id}</code></td>
                  <td>{order.cliente}</td>
                  <td>{order.loja}</td>
                  <td>{order.total_itens}</td>
                  <td style={{ color: '#15803d', fontWeight: 700 }}>{currency(order.valor_total)}</td>
                  <td>{statusBadge(order.status)}</td>
                  <td>{formatDate(order.data)}</td>
                  <td>
                    <button className="ghost-btn" type="button" onClick={() => openOrderDetails(order)}>Detalhes</button>
                  </td>
                </tr>
              ))}
              {!loading.pedidos && orders.length === 0 ? renderLoadingRow(8) : null}
            </tbody>
          </table>
          <Pagination
            total={ordersTotal}
            perPage={10}
            currentPage={orderPage}
            onPageChange={setOrderPage}
          />
        </div>

        <Modal
          open={Boolean(selectedOrder) || orderDetailsLoading}
          title="Detalhes do Pedido"
          onClose={() => setSelectedOrder(null)}
          footer={<button className="ghost-btn" onClick={() => setSelectedOrder(null)} type="button">Fechar</button>}
        >
          {orderDetailsLoading ? <p>Carregando detalhes...</p> : null}
          {!orderDetailsLoading && selectedOrder ? (
            <div className="modal-content-grid">
              <div>
                <p><strong>ID:</strong> {selectedOrder.id}</p>
                <p><strong>Cliente:</strong> {selectedOrder.cliente || '-'}</p>
                <p><strong>Loja:</strong> {selectedOrder.loja || '-'}</p>
                <p><strong>Status:</strong> {selectedOrder.status || '-'}</p>
                <p><strong>Total:</strong> {currency(selectedOrder.valor_total || 0)}</p>
                <p><strong>Data:</strong> {formatDate(selectedOrder.data)}</p>
              </div>
              <div>
                <strong>Itens</strong>
                <ul className="mini-list" style={{ marginTop: 8, marginBottom: 16 }}>
                  {(selectedOrder.itens || []).map((item, index) => (
                    <li key={`${item.id || index}`}>
                      <span>{item.nome || 'Item'} x{item.quantidade || 0}</span>
                      <span>{currency(item.preco || 0)}</span>
                    </li>
                  ))}
                  {(selectedOrder.itens || []).length === 0 ? <li>Sem itens detalhados.</li> : null}
                </ul>
                <strong>Historico</strong>
                <ul className="mini-list" style={{ marginTop: 8 }}>
                  {(selectedOrder.historico_status || []).map((item, index) => (
                    <li key={`${item.status}-${index}`}>
                      <span>{item.status}</span>
                      <span>{formatDate(item.timestamp)}</span>
                    </li>
                  ))}
                  {(selectedOrder.historico_status || []).length === 0 ? <li>Sem historico.</li> : null}
                </ul>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    );
  }

  function renderCatalogs() {
    return (
      <div className="section-stack">
        <div className="toolbar card">
          <input
            className="field"
            placeholder="Buscar catalogo..."
            value={catalogQuery}
            onChange={(e) => setCatalogQuery(e.target.value)}
          />
          <select className="field" value={catalogStoreId} onChange={(e) => setCatalogStoreId(e.target.value)}>
            <option value="Todas">Todas as lojas</option>
            {storeOptions.map((store) => (
              <option key={store.id} value={store.id}>{store.nome}</option>
            ))}
          </select>
        </div>

        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Loja</th>
                <th>Catalogo</th>
                <th>Categorias</th>
                <th>Produtos</th>
                <th>Atualizado</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading.catalogos ? renderLoadingRow(7) : null}
              {!loading.catalogos && catalogs.map((catalog) => (
                <tr key={catalog.id}>
                  <td>{catalog.loja}</td>
                  <td>{catalog.nome}</td>
                  <td>{(catalog.categorias || []).join(', ')}</td>
                  <td>{catalog.total_produtos}</td>
                  <td>{formatDate(catalog.data_atualizacao)}</td>
                  <td>{statusBadge(catalog.status)}</td>
                  <td>
                    <button className="ghost-btn" type="button" onClick={() => toggleCatalogStatus(catalog)}>
                      {catalog.status === 'Publicado' ? 'Pausar' : 'Publicar'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading.catalogos && catalogs.length === 0 ? renderLoadingRow(7) : null}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="section-stack">
        <div className="toolbar card">
          <input
            className="field"
            placeholder="Buscar produto..."
            value={productQuery}
            onChange={(e) => {
              setProductPage(1);
              setProductQuery(e.target.value);
            }}
          />
          <select className="field" value={productStatus} onChange={(e) => { setProductPage(1); setProductStatus(e.target.value); }}>
            <option>Todos</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>

          <div className="toggle-wrap">
            <button
              className={productView === 'grid' ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setProductView('grid')}
              type="button"
            >
              Grid
            </button>
            <button
              className={productView === 'list' ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setProductView('list')}
              type="button"
            >
              Lista
            </button>
          </div>
        </div>

        {productView === 'grid' ? (
          <div className="products-grid">
            {loading.produtos ? <div className="card">Carregando produtos...</div> : null}
            {!loading.produtos && products.map((product) => (
              <article className="card product-card" key={product.id}>
                <div className="emoji-box">{product.imagem_url ? '🖼️' : '📦'}</div>
                <h4>{product.nome}</h4>
                <p>{product.loja} • {product.categoria}</p>
                <strong>{currency(product.preco)}</strong>
                <div className="product-meta">
                  {statusBadge(product.status)}
                  <span>Estoque: {product.estoque}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Loja</th>
                  <th>Categoria</th>
                  <th>Preco</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loading.produtos ? renderLoadingRow(7) : null}
                {!loading.produtos && products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.nome}</td>
                    <td>{product.loja}</td>
                    <td>{product.categoria}</td>
                    <td style={{ color: '#15803d', fontWeight: 700 }}>{currency(product.preco)}</td>
                    <td>{product.estoque}</td>
                    <td>{statusBadge(product.status)}</td>
                    <td>
                      <div className="actions-row">
                        <button className="ghost-btn" type="button" onClick={() => toast.info('Produto', product.nome)}>Ver</button>
                        <button className="ghost-btn" type="button" onClick={() => toggleProductStatus(product)}>
                          {product.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                        </button>
                        <button className="ghost-btn" type="button" onClick={() => removeProduct(product)}>Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading.produtos && products.length === 0 ? renderLoadingRow(7) : null}
              </tbody>
            </table>
            <Pagination
              total={productsTotal}
              perPage={20}
              currentPage={productPage}
              onPageChange={setProductPage}
            />
          </div>
        )}
      </div>
    );
  }

  function renderSection() {
    if (section === 'dashboard') return renderDashboard();
    if (section === 'lojas') return renderStores();
    if (section === 'usuarios') return renderUsers();
    if (section === 'pedidos') return renderOrders();
    if (section === 'catalogos') return renderCatalogs();
    return renderProducts();
  }

  const sectionTitle = navItems.find((item) => item.key === section)?.label || 'Dashboard';

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        .admin-root {
          font-family: system-ui, 'Segoe UI', sans-serif;
          background: #ffffff;
          color: #0f172a;
          min-height: 100vh;
        }
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 220px;
          border-right: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          flex-direction: column;
          padding: 16px;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          color: #15803d;
          margin-bottom: 20px;
        }
        .logo-mark {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #16a34a;
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 900;
        }
        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .nav-btn {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 10px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          color: #334155;
          cursor: pointer;
        }
        .nav-btn.active {
          border-color: #86efac;
          background: #f0fdf4;
          color: #166534;
        }
        .nav-left {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .nav-count {
          background: #bbf7d0;
          color: #166534;
          border-radius: 999px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 700;
        }
        .sidebar-footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #dcfce7;
          color: #166534;
          display: grid;
          place-items: center;
          font-weight: 700;
        }
        .content-shell {
          margin-left: 220px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .topbar {
          height: 56px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 5;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .search-field {
          width: 260px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 10px;
          outline: none;
          font-size: 14px;
        }
        .search-field:focus,
        .field:focus {
          border-color: #16a34a;
        }
        .bell {
          width: 34px;
          height: 34px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: grid;
          place-items: center;
          position: relative;
        }
        .bell-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #16a34a;
        }
        .content-scroll {
          height: calc(100vh - 56px);
          overflow: auto;
          padding: 24px;
          background: #ffffff;
        }
        .section-stack { display: grid; gap: 16px; }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #fff;
          padding: 16px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }
        .metric-card { min-height: 116px; }
        .metric-label { color: #475569; font-size: 13px; }
        .metric-value { display: block; margin: 8px 0; font-size: 24px; }
        .metric-delta { font-size: 12px; font-weight: 600; }
        .metric-delta.positive { color: #15803d; }
        .metric-delta.negative { color: #b91c1c; }

        .dual-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }
        .chart-wrap {
          min-height: 230px;
          display: flex;
          align-items: end;
          gap: 10px;
          padding-top: 12px;
        }
        .bar-col {
          flex: 1;
          text-align: center;
          font-size: 12px;
          color: #475569;
        }
        .bar {
          width: 100%;
          border-radius: 10px 10px 0 0;
          background: #16a34a;
          transition: background .2s;
          margin-bottom: 8px;
        }
        .bar:hover { background: #15803d; }

        .rank-list,
        .activity-list,
        .mini-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 10px;
        }
        .rank-list li,
        .activity-list li,
        .mini-list li {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .activity-text { flex: 1; }
        .activity-time { color: #64748b; font-size: 12px; }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .field {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 9px 10px;
          min-width: 200px;
          outline: none;
          background: #fff;
        }
        .primary-btn {
          border: 1px solid #16a34a;
          background: #16a34a;
          color: #fff;
          border-radius: 10px;
          padding: 9px 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .primary-btn:hover { background: #22c55e; border-color: #22c55e; }

        .ghost-btn, .icon-btn, .toggle-btn, .page-btn {
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #334155;
          border-radius: 10px;
          padding: 8px 10px;
          cursor: pointer;
        }
        .ghost-btn:hover,
        .toggle-btn:hover,
        .page-btn:hover { background: #f8fafc; }

        .icon-btn {
          font-size: 22px;
          line-height: 1;
          width: 34px;
          height: 34px;
          padding: 0;
          display: grid;
          place-items: center;
        }

        .table-wrap { overflow: auto; }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        th, td {
          border-bottom: 1px solid #f1f5f9;
          text-align: left;
          padding: 11px 10px;
          white-space: nowrap;
          vertical-align: middle;
        }
        th {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: .02em;
          font-weight: 700;
        }
        .actions-row {
          display: inline-flex;
          gap: 6px;
        }

        .pagination-wrap {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pagination-info {
          color: #64748b;
          font-size: 13px;
        }
        .pagination-buttons {
          display: inline-flex;
          gap: 6px;
        }
        .page-btn.active,
        .toggle-btn.active {
          background: #16a34a;
          border-color: #16a34a;
          color: #fff;
        }

        .toggle-wrap {
          display: inline-flex;
          gap: 6px;
          margin-left: auto;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .product-card h4 { margin: 0 0 6px; }
        .product-card p { margin: 0 0 8px; color: #64748b; font-size: 13px; }
        .product-card strong { color: #15803d; display: block; margin-bottom: 10px; }
        .product-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 12px;
          color: #475569;
        }
        .emoji-box {
          width: 44px;
          height: 44px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: grid;
          place-items: center;
          margin-bottom: 10px;
          background: #f8fafc;
          font-size: 22px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, .3);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 30;
        }
        .modal-panel {
          width: min(760px, 96vw);
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          max-height: 90vh;
          overflow: auto;
        }
        .modal-header,
        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 17px;
        }
        .modal-footer {
          border-bottom: 0;
          border-top: 1px solid #e2e8f0;
          justify-content: end;
          gap: 8px;
        }
        .modal-body { padding: 14px; }
        .modal-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .modal-content-grid p {
          margin: 0 0 8px;
        }

        .error-banner {
          border: 1px solid #fecaca;
          background: #fff1f2;
          color: #9f1239;
          border-radius: 10px;
          padding: 10px 12px;
        }

        @media (max-width: 1280px) {
          .metrics-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 1100px) {
          .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dual-grid { grid-template-columns: 1fr; }
          .search-field { width: 180px; }
        }
      `}</style>

      <div className="admin-root">
        <aside className="sidebar">
          <div className="logo">
            <span className="logo-mark">M</span>
            MultiStore Admin
          </div>

          <nav className="nav-list">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={section === item.key ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setSection(item.key)}
                type="button"
              >
                <span className="nav-left">
                  {iconFor(item.key)}
                  {item.label}
                </span>
                {navCounts[item.key] > 0 ? <span className="nav-count">{navCounts[item.key]}</span> : null}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="avatar">AD</div>
            <div>
              <strong>Admin</strong>
              <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>Painel multi-loja</p>
            </div>
          </div>
        </aside>

        <div className="content-shell">
          <header className="topbar">
            <h2 style={{ margin: 0, fontSize: 20 }}>{sectionTitle}</h2>
            <div className="topbar-right">
              <input
                className="search-field"
                placeholder="Busca global..."
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
              />
              <div className="bell" title="Notificacoes">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                  <path d="M10 17a2 2 0 0 0 4 0" />
                </svg>
                <span className="bell-dot" />
              </div>
            </div>
          </header>

          <main className="content-scroll">
            {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
            {renderSection()}
          </main>
        </div>
      </div>
    </>
  );
}
