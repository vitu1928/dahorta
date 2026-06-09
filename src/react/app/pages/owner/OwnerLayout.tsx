import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Boxes,
  Package,
  Truck,
  Settings,
  LogOut,
  X,
  Menu,
  Bell,
  Tag,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import { motion, AnimatePresence } from "motion/react";
import logoImage from "figma:asset/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png";

const NAV_ITEMS = [
  { to: "/owner", icon: LayoutDashboard, label: "Analytics", exact: true },
  { to: "/owner/menu", icon: UtensilsCrossed, label: "Cardápio" },
  { to: "/owner/cupons", icon: Tag, label: "Cupons" },
  { to: "/owner/estoque", icon: Boxes, label: "Estoque" },
  { to: "/owner/insumos", icon: Package, label: "Insumos" },
  { to: "/owner/fornecedores", icon: Truck, label: "Fornecedores" },
  { to: "/owner/settings", icon: Settings, label: "Configurações" },
];

export default function OwnerLayout() {
  const { currentUser, logout, restaurantOpen, orders } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingOrders = orders.filter(
    (o) => o.status === "received" || o.status === "preparing"
  ).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="DaHorta"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#FFFFFF",
              padding: 6,
              objectFit: "contain",
              border: "2px solid var(--sidebar-active)",
            }}
          />
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--sidebar-foreground)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              DaHorta
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Painel do Dono
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              color: "rgba(255,255,255,0.6)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Status badge */}
      <div className="px-4 pt-4">
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg"
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
              background: restaurantOpen
                ? "var(--success)"
                : "var(--destructive)",
            }}
          />
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {restaurantOpen ? "Restaurante Aberto" : "Restaurante Fechado"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "0 12px",
            marginBottom: 8,
          }}
        >
          Navegação
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
            style={({ isActive }) => ({
              background: isActive ? "var(--sidebar-active)" : "transparent",
              color: "var(--sidebar-foreground)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  style={{
                    color: "var(--sidebar-foreground)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1 }}>{label}</span>
                {label === "Pedidos" && pendingOrders > 0 && (
                  <span
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {pendingOrders}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-lg"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255,255,255,0.15)",
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
                color: "var(--sidebar-foreground)",
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentUser?.name}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Proprietário
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              color: "rgba(255,255,255,0.6)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--destructive)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
            }
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="owner flex min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* ── Sidebar Desktop ── */}
      <aside
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30"
        style={{
          width: 260,
          background: "var(--sidebar)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Header ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-4"
        style={{
          background: "var(--sidebar)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <img
            src={logoImage}
            alt="DaHorta"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#FFFFFF",
              padding: 5,
              objectFit: "contain",
              border: "1px solid var(--sidebar-active)",
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--sidebar-foreground)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            DaHorta
          </span>
        </div>

        <div className="flex items-center gap-3">
          {pendingOrders > 0 && (
            <div className="relative">
              <Bell size={18} color="rgba(255,255,255,0.8)" />
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{
                  background: "var(--primary)",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                {pendingOrders}
              </span>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              color: "rgba(255,255,255,0.8)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Sidebar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30"
              style={{ background: "rgba(0,0,0,0.7)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-40"
              style={{
                width: 260,
                background: "var(--sidebar)",
                borderRight: "1px solid var(--border)",
              }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main
        className="flex-1 pt-16 lg:pt-0"
        style={{
          marginLeft: 0,
        }}
        {...({ style: { marginLeft: 260 } } as any)}
      >
        <Outlet />
      </main>
    </div>
  );
}