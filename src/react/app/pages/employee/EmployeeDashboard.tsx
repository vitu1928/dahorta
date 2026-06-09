import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  LogOut,
  Clock,
  MapPin,
  ChevronRight,
  Search,
  Package,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import logoImg from "figma:asset/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png";
import {
  Order,
  OrderStatus,
  paymentLabels,
} from "../../store/mockData";

const formatTime = (d: Date) => {
  const diff = Math.floor((new Date().getTime() - new Date(d).getTime()) / 60000);
  if (diff < 1) return "agora";
  if (diff < 60) return `${diff}min atrás`;
  return `${Math.floor(diff / 60)}h ${diff % 60}min atrás`;
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const COLUMNS: {
  status: OrderStatus;
  label: string;
  color: string;
  bg: string;
}[] = [
  { status: "received", label: "Recebidos", color: "#F2994A", bg: "rgba(242,153,74,0.1)" },
  { status: "preparing", label: "Preparando", color: "#E9C46A", bg: "rgba(233,196,106,0.15)" },
  { status: "ready", label: "Prontos", color: "#3AA55D", bg: "rgba(58,165,93,0.1)" },
  { status: "delivering", label: "A Caminho", color: "#2D9CDB", bg: "rgba(45,156,219,0.1)" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  received: "preparing",
  preparing: "ready",
  ready: "delivering",
};

const NEXT_LABELS: Partial<Record<OrderStatus, string>> = {
  received: "Iniciar Preparo",
  preparing: "Marcar Pronto",
  ready: "Aguardando Motoboy",
};

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  colColor: string;
  colBg: string;
}

const OrderCard = React.forwardRef<HTMLDivElement, OrderCardProps>(
  ({ order, onStatusChange, colColor, colBg }, ref) => {
    const nextStatus = NEXT_STATUS[order.status];
    const nextLabel = NEXT_LABELS[order.status];

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-xl overflow-hidden mb-3"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Header strip */}
        <div className="h-1" style={{ background: colColor }} />

        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span
                style={{
                  color: colColor,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {order.id}
              </span>
              <h4
                style={{
                  color: "var(--text-primary)",
                  fontSize: 15,
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {order.customerName}
              </h4>
              <div
                className="flex items-center gap-1 mt-2"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 11,
                }}
              >
                <Clock size={11} />
                {formatTime(order.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div
                style={{
                  color: "var(--text-primary)",
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                {formatCurrency(order.total)}
              </div>
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                {paymentLabels[order.paymentMethod]}
              </div>
            </div>
          </div>

          {/* Items */}
          <div
            className="space-y-2 py-3 mb-3"
            style={{
              borderTop: "1px solid var(--border-light)",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            {order.items.map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                    style={{
                      background: colBg,
                      color: colColor,
                      flexShrink: 0,
                    }}
                  >
                    {item.quantity}
                  </div>
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {item.name}
                  </span>
                </div>
                {item.subItems && item.subItems.length > 0 && (
                  <div className="ml-8 space-y-0.5">
                    {item.subItems.map((si, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="opacity-50">•</span>
                        <span className="font-bold text-[10px] uppercase opacity-60 text-primary">{si.slotName}:</span>
                        <span>{si.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {order.notes && (
              <div
                className="mt-3 p-3 rounded-lg text-xs"
                style={{
                  background: "rgba(233,196,106,0.15)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--accent)",
                }}
              >
                <p style={{ fontWeight: 700, marginBottom: 4 }}>📝 Observações:</p>
                {order.notes}
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-2 mb-3"
            style={{
              color: "var(--text-secondary)",
              fontSize: 11,
            }}
          >
            <MapPin size={12} />
            <span className="truncate">
              {order.deliveryAddress.street}, {order.deliveryAddress.number} —{" "}
              {order.deliveryAddress.neighborhood}
            </span>
          </div>

          {nextStatus && nextLabel && order.status !== "ready" && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus)}
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all"
              style={{
                background: colColor,
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              {nextLabel}
              <ChevronRight size={16} />
            </button>
          )}

          {order.status === "ready" && (
            <div
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
              style={{
                background: "rgba(58,165,93,0.15)",
                color: "var(--success)",
                border: "1px solid var(--success)",
                fontSize: 13,
              }}
            >
              <Clock size={16} />
              Aguardando motoboy
            </div>
          )}

          {order.status === "delivering" && (
            <div
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
              style={{
                background: "rgba(45,156,219,0.15)",
                color: "#2D9CDB",
                border: "1px solid #2D9CDB",
                fontSize: 13,
              }}
            >
              🛵 Saiu para entrega
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

OrderCard.displayName = "OrderCard";

export default function EmployeeDashboard() {
  const { currentUser, logout, orders, updateOrderStatus, restaurantOpen, stockItems } =
    useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<"orders" | "stock">("orders");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const filtered = activeOrders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalToday = orders.length;
  const preparing = orders.filter((o) => o.status === "preparing").length;
  const ready = orders.filter((o) => o.status === "ready").length;

  const lowStockItems = stockItems.filter((item) => item.currentQuantity <= item.minQuantity);

  return (
    <div
      className="employee min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen z-40"
        style={{
          width: 240,
          background: "var(--sidebar)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center gap-3 mb-8">
            <div
              style={{
                width: 64,
                height: 64,
                background: "#FFFFFF",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "2px solid var(--sidebar-active)",
              }}
            >
              <img src={logoImg} alt="DaHorta" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} />
            </div>
            <div className="text-center">
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "var(--sidebar-foreground)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                DaHorta
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 2,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Funcionário
              </div>
            </div>
          </div>

          {/* User */}
          <div
            className="flex items-center gap-3 p-3 rounded-lg mb-6"
            style={{
              background: "var(--sidebar-active)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              {currentUser?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--sidebar-foreground)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser?.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {currentUser?.email}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 mb-6">
            <button
              onClick={() => setActiveView("orders")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
              style={{
                background: activeView === "orders" ? "rgba(255,255,255,0.15)" : "transparent",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeView === "orders" ? 600 : 400,
              }}
            >
              <LayoutDashboard size={18} />
              <span>Pedidos</span>
            </button>
            <button
              onClick={() => setActiveView("stock")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
              style={{
                background: activeView === "stock" ? "rgba(255,255,255,0.15)" : "transparent",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeView === "stock" ? 600 : 400,
              }}
            >
              <Package size={18} />
              <span>Estoque</span>
            </button>
          </nav>

          {/* Status */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
            style={{
              background: restaurantOpen
                ? "rgba(58,165,93,0.15)"
                : "rgba(230,57,70,0.15)",
              border: `1px solid ${
                restaurantOpen ? "var(--success)" : "var(--destructive)"
              }`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: restaurantOpen ? "var(--success)" : "var(--destructive)",
              }}
            />
            <span
              style={{
                color: restaurantOpen ? "#FFFFFF" : "#FFFFFF",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {restaurantOpen ? "Aberto" : "Fechado"}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "var(--sidebar-foreground)",
              cursor: "pointer",
              fontSize: 13,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="p-6"
        style={{
          marginLeft: 240,
        }}
      >
        {activeView === "orders" ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Hoje", value: totalToday, color: "var(--primary)" },
                { label: "Preparando", value: preparing, color: "var(--warning)" },
                { label: "Prontos", value: ready, color: "var(--success)" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-5 text-center"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div
                    style={{
                      color: stat.color,
                      fontSize: 32,
                      fontWeight: 700,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search
                size={16}
                color="var(--muted-foreground)"
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pedido ou cliente..."
                className="w-full pl-11 pr-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px var(--ring)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Kanban */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {COLUMNS.map((col) => {
                  const colOrders = filtered.filter((o) => o.status === col.status);
                  return (
                    <div key={col.status} style={{ width: 320 }}>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: col.color }}
                          />
                          <span
                            style={{
                              color: "var(--text-primary)",
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            {col.label}
                          </span>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: col.bg,
                            color: col.color,
                          }}
                        >
                          {colOrders.length}
                        </span>
                      </div>
                      <div className="min-h-32">
                        <AnimatePresence mode="popLayout">
                          {colOrders.map((order) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              onStatusChange={updateOrderStatus}
                              colColor={col.color}
                              colBg={col.bg}
                            />
                          ))}
                        </AnimatePresence>
                        {colOrders.length === 0 && (
                          <div
                            className="py-12 text-center rounded-xl"
                            style={{
                              border: "1px dashed var(--border)",
                              background: "var(--muted)",
                            }}
                          >
                            <p
                              style={{
                                color: "var(--muted-foreground)",
                                fontSize: 13,
                              }}
                            >
                              Nenhum pedido
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Resumo de Estoque</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Acompanhe os níveis dos insumos para produção.</p>
              </div>
            </div>

            {lowStockItems.length > 0 && (
              <div 
                className="p-4 rounded-xl flex items-center gap-4"
                style={{ background: "rgba(230,57,70,0.1)", border: "1px solid var(--destructive)" }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--destructive)", color: "white" }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 style={{ color: "var(--destructive)", fontWeight: 700, fontSize: 15 }}>Atenção: Estoque Baixo</h4>
                  <p style={{ color: "var(--text-primary)", fontSize: 13 }}>{lowStockItems.length} itens precisam de reposição imediata.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stockItems.map((item) => {
                const isLow = item.currentQuantity <= item.minQuantity;
                const pct = Math.min((item.currentQuantity / (item.minQuantity * 2)) * 100, 100);
                
                return (
                  <div 
                    key={item.id}
                    className="rounded-xl p-5"
                    style={{ 
                      background: "var(--card)", 
                      border: `1px solid ${isLow ? "var(--destructive)" : "var(--border)"}`,
                      boxShadow: "var(--shadow-card)"
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 700 }}>{item.name}</h4>
                        <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Unidade: {item.unit}</span>
                      </div>
                      <div 
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ 
                          background: isLow ? "rgba(230,57,70,0.1)" : "rgba(58,165,93,0.1)",
                          color: isLow ? "var(--destructive)" : "var(--success)",
                          border: `1px solid ${isLow ? "var(--destructive)" : "var(--success)"}`
                        }}
                      >
                        {isLow ? "Crítico" : "OK"}
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-2">
                      <div style={{ fontSize: 24, fontWeight: 800, color: isLow ? "var(--destructive)" : "var(--primary)" }}>
                        {item.currentQuantity.toLocaleString()}
                        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginLeft: 4 }}>{item.unit}</span>
                      </div>
                      <div style={{ textAlign: "right", color: "var(--text-secondary)", fontSize: 11 }}>
                        Meta: {item.minQuantity} {item.unit}
                      </div>
                    </div>

                    <div className="h-1.5 w-full rounded-full" style={{ background: "var(--muted)" }}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${pct}%`, 
                          background: isLow ? "var(--destructive)" : "var(--success)" 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}