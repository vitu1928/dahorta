import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  User, Phone, Mail, MapPin, Package, LogOut,
  ChevronRight, Plus, Pencil, Check, Shield, Bell,
} from "lucide-react";
import { useApp } from "../../store/AppContext";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ProfilePage() {
  const { currentUser, logout, orders } = useApp();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h2 style={{ color: "var(--foreground)", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Faça login</h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginBottom: "24px" }}>
          Acesse sua conta para ver seu perfil
        </p>
        <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-xl font-semibold" style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer" }}>
          Fazer Login
        </button>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.customerId === currentUser.id);
  const totalSpent = myOrders.reduce((s, o) => s + o.total, 0);

  const fieldStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    fontSize: "14px",
    borderRadius: "12px",
  };

  return (
    <div style={{ color: "var(--foreground)" }}>
      <div className="px-4 py-5">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--chart-4))", color: "white" }}
          >
            {currentUser.avatar}
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--foreground)" }}>
            {currentUser.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: "rgba(212,116,95,0.1)", color: "var(--primary)", border: "1px solid rgba(212,116,95,0.22)" }}>
              {currentUser.role === "customer" ? "Cliente" : currentUser.role === "owner" ? "Dono" : currentUser.role === "employee" ? "Funcionário" : "Motoboy"}
            </div>
          </div>
        </motion.div>

        {/* Profile Info */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>Dados Pessoais</h3>
            <button
              onClick={() => {
                if (editMode) setEditMode(false);
                else setEditMode(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: editMode ? "rgba(76,175,80,0.1)" : "rgba(212,116,95,0.1)",
                color: editMode ? "#4CAF50" : "var(--primary)",
                border: `1px solid ${editMode ? "rgba(76,175,80,0.22)" : "rgba(212,116,95,0.22)"}`,
                cursor: "pointer",
              }}
            >
              {editMode ? <><Check size={12} /> Salvar</> : <><Pencil size={12} /> Editar</>}
            </button>
          </div>
          <div className="space-y-3">
            {[
              { icon: <User size={15} />, label: "Nome", key: "name", value: form.name },
              { icon: <Mail size={15} />, label: "E-mail", key: "email", value: form.email },
              { icon: <Phone size={15} />, label: "Telefone", key: "phone", value: form.phone },
            ].map(({ icon, label, key, value }) => (
              <div key={key}>
                <label style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                  {icon}
                  {label}
                </label>
                {editMode ? (
                  <input
                    value={value}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 outline-none"
                    style={fieldStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                ) : (
                  <p style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>{value || "—"}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {[
            { icon: <Package size={18} />, label: "Meus Pedidos", action: () => navigate("/orders"), color: "var(--primary)" },
            { icon: <MapPin size={18} />, label: "Endereços Salvos", action: () => {}, color: "#75B044" },
            { icon: <Bell size={18} />, label: "Notificações", action: () => {}, color: "#a855f7" },
            { icon: <Shield size={18} />, label: "Segurança & Privacidade", action: () => {}, color: "#4CAF50" },
          ].map(({ icon, label, action, color }, i) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-3 px-5 py-4 transition-all text-left"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: i < 3 ? "1px solid var(--border)" : "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--muted)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color === "var(--primary)" ? "rgba(212,116,95,0.14)" : color + "14"}`, color }}>
                {icon}
              </div>
              <span style={{ color: "var(--muted-foreground)", fontSize: "14px", flex: 1 }}>{label}</span>
              <ChevronRight size={16} color="var(--muted-foreground)" />
            </button>
          ))}
        </div>

        {/* Recent Orders */}
        {myOrders.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>Pedidos Recentes</h3>
              <button onClick={() => navigate("/orders")} style={{ color: "var(--primary)", fontSize: "12px", background: "none", border: "none", cursor: "pointer" }}>
                Ver todos
              </button>
            </div>
            <div className="space-y-2">
              {myOrders.slice(0, 2).map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={order.items[0]?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 600 }}>
                      {order.items.map((i) => i.name).join(", ").slice(0, 30)}...
                    </p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{order.id} • {formatCurrency(order.total)}</p>
                  </div>
                  <ChevronRight size={14} color="var(--muted-foreground)" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all"
          style={{ background: "rgba(196,69,54,0.08)", color: "var(--destructive)", border: "1px solid rgba(196,69,54,0.22)", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(196,69,54,0.15)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(196,69,54,0.08)")}
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}