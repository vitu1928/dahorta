import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router";
import { CheckCircle2, Clock, ChefHat, Bike, Home, ArrowLeft, Copy, Check, Star, MessageSquare, MapPin } from "lucide-react";
import { useApp } from "../../store/AppContext";
import { OrderStatus, statusLabels } from "../../store/mockData";
import { MockDeliveryMap } from "../../components/MockDeliveryMap";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { status: "received",  label: "Pedido Recebido",      description: "Seu pedido foi confirmado",              icon: <CheckCircle2 size={20} />, color: "#a855f7" },
  { status: "preparing", label: "Preparando",            description: "Nossa equipe está preparando seu pedido", icon: <ChefHat size={20} />,      color: "#d4745f" },
  { status: "ready",     label: "Pronto para Entrega",   description: "Aguardando o motoboy",                   icon: <Clock size={20} />,        color: "#75B044" },
  { status: "delivering",label: "Saiu para Entrega",     description: "Seu pedido está a caminho!",             icon: <Bike size={20} />,         color: "#2F80ED" },
  { status: "delivered", label: "Entregue",              description: "Bom apetite! 🥗",                       icon: <Home size={20} />,         color: "#4CAF50" },
];

const ORDER_PROGRESS: Record<OrderStatus, number> = {
  received: 0, preparing: 1, ready: 2, delivering: 3, delivered: 4,
};

// ─── Review Form ───────────────────────────────────────────────────────────────
interface ReviewFormProps {
  orderId: string;
  onSubmit: () => void;
}

function ReviewForm({ orderId, onSubmit }: ReviewFormProps) {
  const { currentUser, addReview } = useApp();
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const needsComment = stars > 0 && stars <= 3;
  const canSubmit = stars > 0 && (!needsComment || comment.trim().length > 0);

  const starColor = stars >= 4 ? "#22c55e" : stars === 3 ? "#eab308" : stars > 0 ? "#ef4444" : "#525252";
  const starLabel = stars === 5 ? "Excelente!" : stars === 4 ? "Muito Bom!" : stars === 3 ? "Regular" : stars === 2 ? "Ruim" : stars === 1 ? "Péssimo" : "Toque para avaliar";

  const handleSubmit = () => {
    if (!canSubmit || !currentUser) return;
    addReview({
      orderId,
      stars,
      comment: comment.trim() || undefined,
      createdAt: new Date(),
      customerId: currentUser.id,
      customerName: currentUser.name,
    });
    setSubmitted(true);
    setTimeout(onSubmit, 2000);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <CheckCircle2 size={40} color="#4CAF50" className="mx-auto mb-3" />
        <h3 style={{ color: "#4CAF50", fontSize: "18px", fontWeight: 700 }}>Obrigado pela avaliação!</h3>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>Sua opinião nos ajuda a melhorar sempre.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stars */}
      <div className="text-center">
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: "12px" }}>Como foi a sua experiência?</p>
        <div className="flex justify-center gap-3 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => setStars(s)}
              onMouseEnter={() => setHoverStar(s)}
              onMouseLeave={() => setHoverStar(0)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
            >
              <Star
                size={36}
                fill={s <= (hoverStar || stars) ? "#F4A261" : "transparent"}
                color={s <= (hoverStar || stars) ? "#F4A261" : "var(--border)"}
                style={{ transition: "all 0.15s" }}
              />
            </motion.button>
          ))}
        </div>
        {stars > 0 && (
          <motion.p
            key={stars}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: starColor, fontSize: "14px", fontWeight: 700 }}
          >
            {starLabel}
          </motion.p>
        )}
      </div>

      {/* Comment field */}
      <AnimatePresence>
        {stars > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
              {needsComment ? (
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={13} color="var(--destructive)" />
                  <span style={{ color: "var(--destructive)" }}>Comentário obrigatório para notas ≤ 3 *</span>
                </span>
              ) : (
                "Comentário (opcional)"
              )}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={needsComment ? "Conte o que aconteceu para melhorarmos..." : "Algo especial que gostou ou pode melhorar?"}
              rows={3}
              className="w-full px-4 py-3 rounded-xl outline-none resize-none"
              style={{
                background: "var(--muted)",
                border: `1px solid ${needsComment && !comment.trim() ? "rgba(196,69,54,0.4)" : "var(--border)"}`,
                color: "var(--foreground)", fontSize: "13px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = needsComment && !comment.trim() ? "rgba(196,69,54,0.4)" : "var(--border)")}
            />
            {needsComment && !comment.trim() && (
              <p style={{ color: "var(--destructive)", fontSize: "11px", marginTop: "4px" }}>
                ⚠️ Avaliações com 3 estrelas ou menos exigem um comentário.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
        style={{
          background: canSubmit ? "var(--primary)" : "var(--muted)",
          color: canSubmit ? "white" : "var(--muted-foreground)",
          border: canSubmit ? "none" : "1px solid var(--border)",
          cursor: canSubmit ? "pointer" : "not-allowed",
          fontSize: "14px", fontWeight: 700,
          transition: "all 0.2s",
        }}
      >
        <Star size={16} fill={canSubmit ? "white" : "transparent"} />
        Enviar Avaliação
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, getOrderReview } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  const order = orders.find((o) => o.id === id);
  const existingReview = order ? getOrderReview(order.id) : undefined;

  const copyCode = () => {
    if (order) {
      navigator.clipboard.writeText(order.deliveryCode).catch(() => {});
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
        <h2 style={{ color: "var(--foreground)", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Pedido não encontrado</h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginBottom: "24px" }}>O pedido {id} não existe ou foi removido.</p>
        <button onClick={() => navigate("/menu")} className="px-5 py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer" }}>
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  const currentStep = ORDER_PROGRESS[order.status];
  const isDelivered = order.status === "delivered";
  const isDelivering = order.status === "delivering";

  const estimatedTime = { received: "45-55", preparing: "30-40", ready: "20-30", delivering: "10-20", delivered: "0" }[order.status];

  return (
    <div style={{ color: "var(--foreground)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => navigate("/menu")} className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--foreground)" }}>Acompanhar Pedido</h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{order.id}</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 text-center"
          style={{
            background: isDelivered ? "rgba(76,175,80,0.07)" : "rgba(212,116,95,0.07)",
            border: `1px solid ${isDelivered ? "rgba(76,175,80,0.22)" : "rgba(212,116,95,0.22)"}`,
          }}
        >
          <motion.div
            animate={{ scale: isDelivered ? [1, 1.1, 1] : [1, 1.05, 1] }}
            transition={{ repeat: isDelivered ? 0 : Infinity, duration: 2 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: isDelivered ? "rgba(76,175,80,0.14)" : "rgba(212,116,95,0.14)" }}
          >
            {TIMELINE_STEPS[currentStep].icon &&
              React.cloneElement(TIMELINE_STEPS[currentStep].icon as React.ReactElement, {
                size: 32, color: isDelivered ? "#4CAF50" : "var(--primary)", strokeWidth: 1.5,
              })}
          </motion.div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 800, color: "var(--foreground)" }}>
            {statusLabels[order.status]}
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>{TIMELINE_STEPS[currentStep].description}</p>
          {!isDelivered && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(212,116,95,0.1)", border: "1px solid rgba(212,116,95,0.22)" }}>
              <Clock size={14} color="var(--primary)" />
              <span style={{ color: "var(--primary)", fontSize: "13px", fontWeight: 600 }}>~{estimatedTime} minutos restantes</span>
            </div>
          )}
        </motion.div>

        {/* Live Map - shown when delivering */}
        {isDelivering && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <MockDeliveryMap
              motoboyName="Diego"
              customerAddress={`${order.deliveryAddress.street}, ${order.deliveryAddress.number}`}
            />
          </motion.div>
        )}

        {/* Timeline */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", marginBottom: "20px" }}>Timeline do Pedido</h3>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5" style={{ background: "var(--border)" }} />
            <motion.div
              className="absolute left-5 top-5 w-0.5"
              initial={{ height: 0 }}
              animate={{ height: `${(currentStep / 4) * 100}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{ background: "var(--primary)" }}
            />
            {TIMELINE_STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isPast = i < currentStep;
              const isFuture = i > currentStep;
              return (
                <div key={step.status} className="flex items-start gap-4 mb-6 last:mb-0 relative">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{ background: isPast ? step.color : isActive ? step.color : "var(--border)", border: `2px solid ${isFuture ? "var(--secondary)" : step.color}` }}
                  >
                    {React.cloneElement(step.icon as React.ReactElement, { size: 16, color: isFuture ? "var(--muted-foreground)" : "white" })}
                    {isActive && (
                      <motion.div className="absolute inset-0 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        style={{ border: `2px solid ${step.color}`, background: "transparent" }} />
                    )}
                  </motion.div>
                  <div className="flex-1 pb-1">
                    <p style={{ color: isFuture ? "var(--muted-foreground)" : "var(--foreground)", fontSize: "14px", fontWeight: isActive ? 700 : 500 }}>{step.label}</p>
                    <p style={{ color: isFuture ? "var(--border)" : "var(--muted-foreground)", fontSize: "12px", marginTop: "2px" }}>{step.description}</p>
                  </div>
                  {isPast && <CheckCircle2 size={16} color={step.color} className="flex-shrink-0 mt-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", marginBottom: "12px" }}>Detalhes do Pedido</h3>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg overflow-hidden"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{item.quantity}x {item.name}</span>
              </div>
              <span style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3">
            <span style={{ color: "var(--foreground)", fontSize: "14px", fontWeight: 700 }}>Total</span>
            <span style={{ color: "var(--primary)", fontSize: "16px", fontWeight: 800 }}>{formatCurrency(order.total)}</span>
          </div>

          {(order.notes || order.addressNotes) && (
            <div className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
              {order.notes && (
                <div className="flex gap-2">
                  <MessageSquare size={14} className="mt-0.5 text-muted-foreground" />
                  <div>
                    <span style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Observações do Pedido</span>
                    <p style={{ color: "var(--foreground)", fontSize: "13px", marginTop: "2px" }}>{order.notes}</p>
                  </div>
                </div>
              )}
              {order.addressNotes && (
                <div className="flex gap-2">
                  <MapPin size={14} className="mt-0.5 text-muted-foreground" />
                  <div>
                    <span style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Ponto de Referência</span>
                    <p style={{ color: "var(--foreground)", fontSize: "13px", marginTop: "2px" }}>{order.addressNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delivery Code */}
        {!isDelivered && (
          <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", marginBottom: "4px" }}>Código de Confirmação</h3>
            <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginBottom: "12px" }}>Informe este código ao motoboy ao receber seu pedido</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 py-4 rounded-xl text-center font-bold tracking-widest"
                style={{ background: "var(--muted)", color: "var(--primary)", fontSize: "28px", letterSpacing: "8px", border: "1px dashed rgba(212,116,95,0.3)" }}>
                {order.deliveryCode}
              </div>
              <button onClick={copyCode}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "var(--muted)", border: "1px solid var(--border)", color: copiedCode ? "#4CAF50" : "var(--muted-foreground)", cursor: "pointer" }}>
                {copiedCode ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* Post-Delivery: Rating Section */}
        {isDelivered && (
          <>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🥗</div>
              <h3 style={{ color: "#4CAF50", fontSize: "20px", fontWeight: 700 }}>Pedido Entregue!</h3>
              <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>Obrigado por escolher o DaHorta!</p>
              <button onClick={() => navigate("/menu")} className="mt-4 px-6 py-3 rounded-xl font-semibold"
                style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer" }}>
                Pedir Novamente
              </button>
            </motion.div>

            {!reviewDone && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5"
                style={{ background: "var(--card)", border: "1px solid rgba(244,162,97,0.3)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star size={18} color="#F4A261" fill="#F4A261" />
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--foreground)" }}>
                    {existingReview ? "Sua Avaliação" : "Avalie seu Pedido"}
                  </h3>
                </div>

                {existingReview ? (
                  <div className="text-center py-4">
                    <div className="flex justify-center gap-1.5 mb-3">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={28} fill={s <= existingReview.stars ? "#F4A261" : "transparent"} color={s <= existingReview.stars ? "#F4A261" : "var(--border)"} />
                      ))}
                    </div>
                    {existingReview.comment && (
                      <p style={{ color: "var(--muted-foreground)", fontSize: "13px", fontStyle: "italic" }}>"{existingReview.comment}"</p>
                    )}
                    <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginTop: "8px" }}>Avaliação enviada. Obrigado!</p>
                  </div>
                ) : (
                  <ReviewForm orderId={order.id} onSubmit={() => setReviewDone(true)} />
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}