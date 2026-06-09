import React, { useState } from "react";
import { motion } from "motion/react";
import { Clock, MapPin, CreditCard, Phone, Search, ChevronRight } from "lucide-react";
import { useApp } from "../../store/AppContext";
import { Order, OrderStatus, statusLabels, statusColors, paymentLabels } from "../../store/mockData";

const formatTime = (d: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(d).getTime()) / 60000);
  if (diff < 1) return "agora";
  if (diff < 60) return `${diff}min`;
  return `${Math.floor(diff / 60)}h${diff % 60 > 0 ? `${diff % 60}m` : ""}`;
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const COLUMNS: { status: OrderStatus; label: string; color: string; bg: string }[] = [
  { status: "received",  label: "Recebido",   color: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  { status: "preparing", label: "Preparando", color: "#d4745f", bg: "rgba(212,116,95,0.08)" },
  { status: "ready",     label: "Pronto",     color: "#75B044", bg: "rgba(117,176,68,0.08)" },
  { status: "delivering",label: "A Caminho",  color: "#2F80ED", bg: "rgba(47,128,237,0.08)" },
  { status: "delivered", label: "Entregue",   color: "#4CAF50", bg: "rgba(76,175,80,0.08)"  },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  received: "preparing",
  preparing: "ready",
  ready: "delivering",
  delivering: "delivered",
};

const NEXT_LABELS: Partial<Record<OrderStatus, string>> = {
  received: "Iniciar Preparo",
  preparing: "Marcar Pronto",
  ready: "Sair p/ Entrega",
  delivering: "Confirmar Entrega",
};

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const nextStatus = NEXT_STATUS[order.status];
  const nextLabel = NEXT_LABELS[order.status];
  const col = COLUMNS.find((c) => c.status === order.status)!;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 mb-3"
      style={{ background: "#2d4a2d", border: "1px solid #3a4e35" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span style={{ color: "#d4745f", fontSize: "12px", fontWeight: 700 }}>{order.id}</span>
          <h4 style={{ color: "#f5f1e8", fontSize: "14px", fontWeight: 600, marginTop: "2px" }}>{order.customerName}</h4>
        </div>
        <div className="flex items-center gap-1" style={{ color: "#525252", fontSize: "11px" }}>
          <Clock size={12} />
          {formatTime(order.createdAt)}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex flex-col">
            <div className="flex items-center justify-between">
              <span style={{ color: "#a3a3a3", fontSize: "12px", fontWeight: 600 }}>
                {item.quantity}x {item.name}
              </span>
              <span style={{ color: "#525252", fontSize: "11px" }}>{formatCurrency(item.price * item.quantity)}</span>
            </div>
            {item.subItems && item.subItems.length > 0 && (
              <div className="ml-4 space-y-0.5 mt-0.5">
                {item.subItems.map((si, idx) => (
                  <p key={idx} style={{ color: "rgba(163,163,163,0.7)", fontSize: "10px" }}>
                    • <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "9px", color: "#d4745f" }}>{si.slotName}:</span> {si.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="h-px mb-3" style={{ background: "#3a4e35" }} />

      {/* Footer */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5" style={{ color: "#9da89a", fontSize: "11px" }}>
          <CreditCard size={11} />
          {paymentLabels[order.paymentMethod]}
        </div>
        <span style={{ color: "#f5f1e8", fontSize: "13px", fontWeight: 700 }}>{formatCurrency(order.total)}</span>
      </div>

      <div className="flex items-center gap-1.5 mb-3" style={{ color: "#9da89a", fontSize: "11px" }}>
        <MapPin size={11} />
        <span className="truncate">{order.deliveryAddress.street}, {order.deliveryAddress.number}</span>
      </div>

      {nextStatus && nextLabel && (
        <button
          onClick={() => onStatusChange(order.id, nextStatus)}
          className="w-full py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-all"
          style={{ background: col.bg, border: `1px solid ${col.color}30`, color: col.color, cursor: "pointer" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = `${col.color}18`)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = col.bg)}
        >
          {nextLabel}
          <ChevronRight size={13} />
        </button>
      )}

      {order.status === "delivered" && (
        <div className="w-full py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold" style={{ background: "rgba(76,175,80,0.1)", color: "#4CAF50" }}>
          ✓ Entregue
        </div>
      )}
    </motion.div>
  );
}

export default function OrdersManagementPage() {
  const { orders, updateOrderStatus } = useApp();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const filtered = orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8" style={{ color: "#f5f1e8" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="overline-label mb-2">Gestão</p>
          <h1 className="display-heading" style={{ fontSize: 26, color: "#f5f1e8" }}>
            Pedidos
          </h1>
          <p style={{ color: "#9da89a", fontSize: "13px", marginTop: "2px" }}>
            {orders.filter((o) => o.status !== "delivered").length} pedidos ativos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} color="#525252" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pedido..."
              className="pl-9 pr-4 py-2 rounded-xl outline-none text-sm"
              style={{ background: "#253625", border: "1px solid #3a4e35", color: "#f5f1e8", width: "200px" }}
              onFocus={(e) => (e.target.style.borderColor = "#d4745f")}
              onBlur={(e) => (e.target.style.borderColor = "#3a4e35")}
            />
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#253625", border: "1px solid #3a4e35" }}>
            {["kanban", "list"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as "kanban" | "list")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
                style={{ background: view === v ? "#d4745f" : "transparent", color: view === v ? "white" : "#9da89a", border: "none", cursor: "pointer" }}
              >
                {v === "kanban" ? "Kanban" : "Lista"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => {
              const colOrders = filtered.filter((o) => o.status === col.status);
              return (
                <div key={col.status} className="w-72">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                      <span style={{ color: "#9da89a", fontSize: "13px", fontWeight: 600 }}>{col.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: col.bg, color: col.color }}>
                      {colOrders.length}
                    </span>
                  </div>
                  <div className="min-h-24">
                    {colOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
                    ))}
                    {colOrders.length === 0 && (
                      <div className="py-8 text-center rounded-xl" style={{ border: "1px dashed #3a4e35" }}>
                        <p style={{ color: "#9da89a", fontSize: "12px" }}>Nenhum pedido</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#2d4a2d", border: "1px solid #3a4e35" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #3a4e35" }}>
                  {["Pedido", "Cliente", "Itens", "Total", "Pagamento", "Tempo", "Status", "Ação"].map((h) => (
                    <th key={h} className="text-left px-4 py-3" style={{ color: "#9da89a", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const nextStatus = NEXT_STATUS[order.status];
                  const nextLabel = NEXT_LABELS[order.status];
                  const col = COLUMNS.find((c) => c.status === order.status)!;
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid #3a4e35" }}>
                      <td className="px-4 py-3" style={{ color: "#d4745f", fontSize: "13px", fontWeight: 600 }}>{order.id}</td>
                      <td className="px-4 py-3" style={{ color: "#f5f1e8", fontSize: "13px" }}>{order.customerName}</td>
                      <td className="px-4 py-3" style={{ color: "#9da89a", fontSize: "12px" }}>{order.items.length} itens</td>
                      <td className="px-4 py-3" style={{ color: "#f5f1e8", fontSize: "13px", fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3" style={{ color: "#9da89a", fontSize: "12px" }}>{paymentLabels[order.paymentMethod]}</td>
                      <td className="px-4 py-3" style={{ color: "#9da89a", fontSize: "12px" }}>{formatTime(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: col.bg, color: col.color }}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {nextStatus && nextLabel && (
                          <button
                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={{ background: col.bg, border: `1px solid ${col.color}30`, color: col.color, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            {nextLabel}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}