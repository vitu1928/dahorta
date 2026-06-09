import React from "react";
import { useApp } from "../../store/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, Outlet, NavLink, useNavigate } from "react-router";
import { ShoppingCart, Home, Package, User, LogOut } from "lucide-react";
import logoImg from "figma:asset/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png";
import heroImg from "figma:asset/6a6cb4394cfe8dac99d70ae300042099f5cbd856.png";

export default function CustomerLayout() {
  const { cartCount, logout, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isMenuPage = location.pathname === "/menu" || location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/menu", icon: Home, label: "Cardápio" },
    { to: "/cart", icon: ShoppingCart, label: "Carrinho", badge: cartCount },
    { to: "/orders", icon: Package, label: "Meus Pedidos" },
    { to: "/profile", icon: User, label: "Meu Perfil" },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)" }}
    >
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col sticky top-0 h-screen z-40"
        style={{
          width: 280,
          background: "var(--background)",
          borderRight: "1px solid var(--border-light)",
        }}
      >
        <div className="p-8 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div
              style={{
                width: 56,
                height: 56,
                background: "#FFFFFF",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 6,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                border: "1px solid var(--border-light)",
              }}
            >
              <img src={logoImg} alt="DaHorta" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} />
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "var(--primary)",
              }}
            >
              DaHorta
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={({ isActive }) => ({
                  background: isActive ? "var(--secondary)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                  textDecoration: "none",
                  fontWeight: isActive ? 700 : 500,
                })}
              >
                <div className="relative">
                  <Icon size={20} />
                  {badge !== undefined && badge > 0 && (
                    <span
                      className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{
                        background: "var(--primary)",
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border-none bg-transparent cursor-pointer font-medium"
          >
            <LogOut size={20} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 font-sans">
        {/* ── Top Header (Mobile only) ── */}
        {!isMenuPage && (
          <header
            className="md:hidden relative overflow-hidden"
            style={{
              height: 100,
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            {/* Header Background with Overlay */}
            <img 
              src={heroImg}
              alt="Hero Background"
              className="absolute inset-0 z-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 z-[1]" />
            <div
              className="flex items-center justify-between px-6 h-full mx-auto relative z-10"
              style={{ maxWidth: 1200 }}
            >
              {/* Logo and Name */}
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: "#FFFFFF",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 4,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                    border: "2px solid var(--primary)",
                  }}
                >
                  <img src={logoImg} alt="DaHorta" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} />
                </div>
                <div className="flex flex-col">
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 20,
                      fontWeight: 800,
                      color: "white",
                    }}
                  >
                    DaHorta
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 500 }}>
                    Bowls orgânicos, frescos e cheios de vida.
                  </span>
                </div>
              </div>

              {/* Cart button */}
              <motion.button
                onClick={() => navigate("/cart")}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all border-none"
                style={{
                  background:
                    cartCount > 0 ? "var(--primary)" : "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                  border: `1px solid ${
                    cartCount > 0 ? "var(--primary)" : "rgba(255,255,255,0.3)"
                  }`,
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <ShoppingCart
                  size={18}
                  color="white"
                />
                {cartCount > 0 && (
                  <span
                    style={{
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </motion.button>
            </div>
          </header>
        )}

        {/* Main content */}
        <main className="flex-1 pb-24 md:pb-8">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1200 }}>
            <Outlet />
          </div>
        </main>

        {/* ── Bottom Nav (Mobile only) ── */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
          style={{
            background: "var(--background)",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <div
            className="flex items-center justify-around mx-auto px-4 py-2"
            style={{ maxWidth: 600 }}
          >
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all"
                style={({ isActive }) => ({
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                  textDecoration: "none",
                  position: "relative",
                  border: "none",
                  background: "transparent"
                })}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className="relative flex items-center justify-center transition-all"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: isActive ? "var(--secondary)" : "transparent",
                      }}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2 : 1.8} />
                      {badge !== undefined && badge > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                          style={{
                            background: "var(--primary)",
                            fontSize: 9,
                            fontWeight: 700,
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: isActive ? 600 : 400,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {label.replace("Meu ", "")}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}