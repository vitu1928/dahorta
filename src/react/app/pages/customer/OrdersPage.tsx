import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ChevronRight, Package } from "lucide-react";
import { useApp } from "../../store/AppContext";
import { statusLabels, statusColors, paymentLabels } from "../../store/mockData";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (d: Date) => {
  const date = new Date(d);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function OrdersPage() {
  const { orders, currentUser } = useApp();
  const navigate = useNavigate();

  const myOrders = orders.filter((o) => !currentUser || o.customerId === currentUser.id || currentUser.role === "owner");

  if (myOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(212,116,95,0.08)", border: "2px solid rgba(212,116,95,0.18)" }}>
          <Package size={32} color="var(--primary)" strokeWidth={1.5} />
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--foreground)", marginBottom: "8px" }}>
          Nenhum pedido ainda
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginBottom: "24px" }}>
          Seus pedidos aparecerão aqui após sua primeira compra
        </p>
        <button onClick={() => navigate("/menu")} className="px-6 py-3 rounded-xl font-semibold" style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer" }}>
          Explorar Cardápio
        </button>
      </div>
    );
  }

  return (
    <div style={{ color: "var(--foreground)" }}>
      <div className="px-4 py-5">
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "22px", fontWeight: 700, color: "var(--foreground)", marginBottom: "4px" }}>
          Meus Pedidos
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: "20px" }}>{myOrders.length} pedido{myOrders.length !== 1 ? "s" : ""}</p>

        <div className="space-y-3">
          {myOrders.map((order, i) => {
            const color = statusColors[order.status];
            const isActive = order.status !== "delivered";
            return (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/order/${order.id}`)}
                className="w-full text-left rounded-2xl overflow-hidden transition-all"
                style={{ background: "var(--card)", border: `1px solid ${isActive ? `${color}30` : "var(--border)"}`, cursor: "pointer" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = color)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = isActive ? `${color}30` : "var(--border)")}
              >
                <div className="h-1" style={{ background: color }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span style={{ color, fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>{order.id}</span>
                      <p style={{ color: "var(--foreground)", fontSize: "15px", fontWeight: 600, marginTop: "2px" }}>
                        {order.items.map((i) => i.name).join(", ").slice(0, 40)}
                        {order.items.map((i) => i.name).join(", ").length > 40 ? "..." : ""}
                      </p>
                    </div>
                    <ChevronRight size={18} color="var(--muted-foreground)" className="mt-1 flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold" style={{ background: `${color}18`, color }}>
                        {statusLabels[order.status]}
                      </span>
                      <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{formatDate(order.createdAt)}</span>
                    </div>
                    <span style={{ color: "var(--foreground)", fontSize: "14px", fontWeight: 700 }}>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}