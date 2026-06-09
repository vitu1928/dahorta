import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  LogOut,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Package,
  Bike,
  MapPinOff,
  RefreshCw,
  Loader2,
  User,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import logoImg from "figma:asset/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png";
import { Order } from "../../store/mockData";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type LocationStatus = "checking" | "granted" | "denied" | "unsupported";

// ─── Location Gate ─────────────────────────────────────────────────────────────
function LocationGate({ onGranted }: { onGranted: () => void }) {
  const [requesting, setRequesting] = useState(false);

  const requestLocation = () => {
    setRequesting(true);
    // Simulação da localização para o sistema da horta em ambiente de demo
    setTimeout(() => {
      setRequesting(false);
      onGranted();
    }, 1500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--background-soft)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: "var(--secondary)",
            border: "1px solid var(--primary)",
          }}
        >
          <MapPin size={36} color="var(--primary)" />
        </motion.div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          Localização Necessária
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Para usar o sistema de entregas, você precisa ativar sua localização.
          Isso permite que o cliente acompanhe sua entrega em tempo real.
        </p>
        <div
          className="space-y-3 text-left mb-8 px-4 py-4 rounded-xl"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          {[
            "O cliente verá sua localização no mapa",
            "Garante a segurança da entrega",
            "Otimiza o rastreamento em tempo real",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(58,165,93,0.15)",
                  border: "1px solid var(--success)",
                }}
              >
                <CheckCircle2 size={12} color="var(--success)" />
              </div>
              <span
                style={{ color: "var(--text-secondary)", fontSize: 13 }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={requestLocation}
          disabled={requesting}
          className="w-full py-4 rounded-xl flex items-center justify-center gap-3"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {requesting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <MapPin size={20} />
          )}
          {requesting ? "Solicitando acesso..." : "Ativar Localização"}
        </button>
        <p
          style={{
            color: "var(--muted-foreground)",
            fontSize: 12,
            marginTop: 16,
          }}
        >
          Sua privacidade é protegida. A localização só é compartilhada durante a
          entrega.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Location Warning Banner ───────────────────────────────────────────────────
function LocationWarning({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-4 mt-2 p-3 rounded-lg flex items-center gap-3"
      style={{
        background: "rgba(242,153,74,0.1)",
        border: "1px solid var(--warning)",
      }}
    >
      <MapPinOff size={16} color="var(--warning)" className="flex-shrink-0" />
      <p style={{ color: "var(--warning)", fontSize: 12, flex: 1 }}>
        Localização desativada. O cliente não consegue acompanhar sua entrega.
      </p>
      <button
        onClick={onDismiss}
        style={{
          color: "var(--warning)",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <RefreshCw size={14} />
      </button>
    </motion.div>
  );
}

// ─── Delivery Card ─────────────────────────────────────────────────────────────
interface DeliveryCardProps {
  order: Order;
  onConfirm: (orderId: string, code: string) => boolean;
  onStartDelivery: (orderId: string) => void;
}

function DeliveryCard({
  order,
  onConfirm,
  onStartDelivery,
}: DeliveryCardProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    const success = onConfirm(order.id, code);
    if (success) {
      setConfirmed(true);
      setError("");
    } else setError("Código incorreto. Tente novamente.");
  };

  const isDelivering = order.status === "delivering";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: confirmed
          ? "rgba(58,165,93,0.08)"
          : "var(--card)",
        border: `1px solid ${
          confirmed
            ? "var(--success)"
            : isDelivering
            ? "var(--primary)"
            : "var(--border)"
        }`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="h-1"
        style={{
          background: confirmed
            ? "var(--success)"
            : isDelivering
            ? "var(--primary)"
            : "var(--accent)",
        }}
      />
      <div className="p-4">
        {confirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-4 text-center"
          >
            <CheckCircle2 size={48} color="var(--success)" strokeWidth={1.5} />
            <h3
              style={{
                color: "var(--success)",
                fontSize: 18,
                fontWeight: 700,
                marginTop: 12,
              }}
            >
              Entregue!
            </h3>
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Pedido {order.id} finalizado
            </p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  style={{
                    color: isDelivering ? "var(--primary)" : "var(--accent)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  {order.id}
                </span>
                <h3
                  style={{
                    color: "var(--text-primary)",
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 2,
                  }}
                >
                  {order.customerName}
                </h3>
              </div>
              <div
                className="px-2.5 py-1 rounded-lg"
                style={{
                  background: isDelivering
                    ? "rgba(76,124,89,0.15)"
                    : "rgba(233,196,106,0.15)",
                  border: `1px solid ${
                    isDelivering ? "var(--primary)" : "var(--accent)"
                  }`,
                  color: isDelivering ? "var(--primary)" : "var(--accent)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {isDelivering ? "🛵 A Caminho" : "✓ Pronto"}
              </div>
            </div>

            <div
              className="p-3 rounded-lg mb-3"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin size={14} color="var(--primary)" />
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Endereço de Entrega
                </span>
              </div>
              <p
                style={{
                  color: "var(--text-primary)",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {order.deliveryAddress.street}, {order.deliveryAddress.number}
                {order.deliveryAddress.complement &&
                  ` — ${order.deliveryAddress.complement}`}
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  marginTop: 1,
                }}
              >
                {order.deliveryAddress.neighborhood} ·{" "}
                {order.deliveryAddress.city}
              </p>
            </div>

            {order.notes && (
              <div
                className="p-3 rounded-lg mb-3"
                style={{
                  background: "rgba(76,124,89,0.1)",
                  border: "1px solid var(--primary)",
                }}
              >
                <p style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  📝 Observações do pedido:
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.4 }}>
                  {order.notes}
                </p>
              </div>
            )}

            {order.addressNotes && (
              <div
                className="p-3 rounded-lg mb-3"
                style={{
                  background: "rgba(233,196,106,0.15)",
                  border: "1px solid var(--accent)",
                }}
              >
                <p style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  📍 Observações de ponto de referência:
                </p>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.4 }}>
                  {order.addressNotes}
                </p>
              </div>
            )}

            <div
              className="flex items-center gap-3 mb-3 p-2.5 rounded-lg"
              style={{ background: "var(--muted)" }}
            >
              <Phone size={14} color="var(--muted-foreground)" />
              <span style={{ color: "var(--text-primary)", fontSize: 13 }}>
                {order.customerPhone}
              </span>
              <a
                href={`tel:${order.customerPhone}`}
                className="ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: "rgba(58,165,93,0.15)",
                  color: "var(--success)",
                  border: "1px solid var(--success)",
                  textDecoration: "none",
                }}
              >
                Ligar
              </a>
            </div>

            <div className="mb-3">
              <p
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: 6,
                }}
              >
                Itens ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </p>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-0.5">
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 12,
                    }}
                  >
                    {item.quantity}x {item.name}
                  </span>
                </div>
              ))}
              <div
                className="flex items-center justify-between pt-1.5 mt-1.5"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                  Total
                </span>
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {!isDelivering ? (
              <button
                onClick={() => onStartDelivery(order.id)}
                className="w-full py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--primary-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--primary)")
                }
              >
                <Navigation size={18} />
                Iniciar Entrega
              </button>
            ) : (
              <div>
                <p
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: 12,
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Código de confirmação do cliente:
                </p>
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError("");
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 px-3 py-2.5 rounded-lg outline-none text-center font-bold tracking-widest"
                    style={{
                      background: "var(--input-background)",
                      border: `1px solid ${
                        error ? "var(--destructive)" : "var(--border)"
                      }`,
                      color: "var(--text-primary)",
                      fontSize: 16,
                      letterSpacing: "4px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.boxShadow = "0 0 0 3px var(--ring)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = error
                        ? "var(--destructive)"
                        : "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    onClick={handleConfirm}
                    disabled={code.length < 6}
                    className="px-4 py-2.5 rounded-lg font-bold"
                    style={{
                      background:
                        code.length >= 6 ? "var(--primary)" : "var(--muted)",
                      color:
                        code.length >= 6
                          ? "var(--primary-foreground)"
                          : "var(--muted-foreground)",
                      border: "none",
                      cursor: code.length >= 6 ? "pointer" : "not-allowed",
                      fontSize: 13,
                    }}
                  >
                    OK
                  </button>
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mt-2"
                    style={{
                      color: "var(--destructive)",
                      fontSize: 11,
                    }}
                  >
                    <AlertCircle size={12} />
                    {error}
                  </motion.div>
                )}
                <p
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: 10,
                    marginTop: 6,
                  }}
                >
                  💡 Para demo, o código é:{" "}
                  <strong style={{ color: "var(--text-primary)" }}>
                    {order.deliveryCode}
                  </strong>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function MotoboyDashboard() {
  const { currentUser, logout, orders, updateOrderStatus, confirmDelivery } =
    useApp();
  const navigate = useNavigate();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("checking");
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }
    // Check current permission state
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") setLocationStatus("granted");
          else if (result.state === "denied") setLocationStatus("denied");
          else setLocationStatus("denied"); // prompt — show gate
          result.onchange = () => {
            if (result.state === "granted") setLocationStatus("granted");
            else setLocationStatus("denied");
          };
        })
        .catch(() => setLocationStatus("denied"));
    } else {
      setLocationStatus("denied");
    }
  }, []);

  // Watch location during active deliveries
  useEffect(() => {
    if (locationStatus !== "granted") return;
    const myDeliveries = orders.filter((o) => o.status === "delivering");
    if (myDeliveries.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      () => setShowLocationWarning(false),
      () => setShowLocationWarning(true),
      { timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationStatus, orders]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeDelivery = orders.find(
    (o) => o.status === "delivering" && o.motoboyId === currentUser?.id
  );

  const handleStartDelivery = (id: string) => {
    if (activeDelivery) {
      toast.error("Você já possui um pedido em rota!");
      return;
    }
    updateOrderStatus(id, "delivering", currentUser?.id);
  };

  const myOrders = orders.filter(
    (o) =>
      (o.status === "ready" || o.status === "delivering") &&
      (o.motoboyId === currentUser?.id || o.status === "ready")
  );
  const delivered = orders.filter(
    (o) => o.status === "delivered" && o.motoboyId === currentUser?.id
  ).length;

  if (locationStatus === "checking") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <Loader2
            size={32}
            color="var(--primary)"
            className="mx-auto mb-3 animate-spin"
          />
          <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
            Verificando localização...
          </p>
        </div>
      </div>
    );
  }

  if (locationStatus === "denied" || locationStatus === "unsupported") {
    return <LocationGate onGranted={() => setLocationStatus("granted")} />;
  }

  return (
    <div
      className="motoboy min-h-screen flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Top Bar - Mobile First */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "var(--sidebar)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                border: "1px solid var(--sidebar-active)",
              }}
            >
              <img
                src={logoImg}
                alt="DaHorta"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "50%",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "var(--sidebar-foreground)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                DaHorta
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Entregas
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Location Status */}
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{
                background: "rgba(58,165,93,0.15)",
                border: "1px solid var(--success)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--success)",
                }}
              />
              <MapPin size={12} color="#FFFFFF" />
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "var(--sidebar-foreground)",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {currentUser?.avatar || <User size={16} />}
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-20"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      <div className="p-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>
                          {currentUser?.name}
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 11, marginTop: 1 }}>
                          {currentUser?.email}
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-secondary)",
                          fontSize: 13,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--muted)";
                          e.currentTarget.style.color = "var(--destructive)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                      >
                        <LogOut size={14} />
                        Sair
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Location Warning */}
      <AnimatePresence>
        {showLocationWarning && (
          <LocationWarning onDismiss={() => setShowLocationWarning(false)} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        <div className="max-w-lg mx-auto">
          {/* Greeting */}
          <div className="mb-4">
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Olá, {currentUser?.name?.split(" ")[0]}! 🏍️
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginTop: 2,
              }}
            >
              {myOrders.length > 0
                ? `${myOrders.length} entrega${myOrders.length > 1 ? "s" : ""} ${myOrders.length > 1 ? "pendentes" : "pendente"}`
                : "Nenhuma entrega no momento"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              {
                label: "Prontas",
                value: myOrders.filter((o) => o.status === "ready").length,
                color: "var(--accent)",
                icon: <Package size={14} />,
              },
              {
                label: "Em Rota",
                value: myOrders.filter((o) => o.status === "delivering").length,
                color: "var(--primary)",
                icon: <Bike size={14} />,
              },
              {
                label: "Entregues",
                value: delivered || 0,
                color: "var(--success)",
                icon: <CheckCircle2 size={14} />,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div
                  style={{
                    color: stat.color,
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 4,
                  }}
                >
                  {stat.icon}
                </div>
                <div
                  style={{
                    color: stat.color,
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 10,
                    marginTop: 1,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Orders */}
          {myOrders.length > 0 ? (
            <div className="space-y-3">
              <h2
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Suas Entregas
              </h2>
              <AnimatePresence>
                {myOrders.map((order) => (
                  <DeliveryCard
                    key={order.id}
                    order={order}
                    onStartDelivery={(id) => handleStartDelivery(id)}
                    onConfirm={(id, code) => confirmDelivery(id, code)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center rounded-xl"
              style={{
                border: "1px dashed var(--border)",
                background: "var(--muted)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 8 }}>🛵</div>
              <h3
                style={{
                  color: "var(--text-primary)",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Aguardando pedidos
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Novos pedidos aparecerão aqui quando estiverem prontos
              </p>
            </motion.div>
          )}

          {/* History */}
          {delivered > 0 && (
            <div className="mt-6">
              <h2
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: 8,
                }}
              >
                Histórico de Hoje
              </h2>
              {orders
                .filter((o) => o.status === "delivered")
                .slice(0, 3)
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg mb-2"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={14} color="var(--success)" />
                      <div>
                        <p
                          style={{
                            color: "var(--text-primary)",
                            fontSize: 12,
                          }}
                        >
                          {order.customerName}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 10,
                          }}
                        >
                          {order.id}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        color: "var(--text-primary)",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
