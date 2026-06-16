import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  ChevronRight,
  Tag,
  CheckCircle2,
  XCircle,
  Percent,
} from "lucide-react";
import { useApp } from "../../store/AppContext";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CartPage() {
  const {
    cart,
    cartTotal,
    cartCount,
    deliveryFee,
    removeFromCart,
    updateCartQuantity,
    orderNotes,
    setOrderNotes,
    applyCoupon,
    removeCoupon,
    activeCoupon,
    discountAmount,
    coupons,
    currentUser,
  } = useApp();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (!success) {
      setCouponError("Cupom inválido, expirado ou não aplicável.");
    } else {
      setCouponInput("");
    }
  };

  const total = cartTotal - discountAmount + deliveryFee;

  if (cart.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"
        style={{ background: "var(--background)" }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14 }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "var(--secondary)",
              border: "1px solid var(--primary)",
            }}
          >
            <ShoppingCart
              size={32}
              color="var(--primary)"
              strokeWidth={1.5}
            />
          </div>
          <h2
            className="mb-3"
            style={{
              fontSize: 24,
              color: "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            Carrinho vazio
          </h2>
          <p
            className="mb-8"
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            Adicione itens do cardápio para fazer seu pedido
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/menu")}
            className="px-8 py-3 rounded-lg"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 600,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--primary)")
            }
          >
            Ver Cardápio
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 py-5"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate("/menu")}
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            color: "var(--muted-foreground)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
        </motion.button>
        <div>
          <h1
            style={{
              fontSize: 22,
              color: "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            Seu Carrinho
          </h1>
        </div>
        <span
          className="ml-auto"
          style={{
            background: "var(--secondary)",
            border: "1px solid var(--primary)",
            color: "var(--primary)",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {cartCount} {cartCount === 1 ? "item" : "itens"}
        </span>
      </div>

      <div className="px-6 py-6">
        {/* Cart Items */}
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </h4>
                  {item.subItems && item.subItems.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {item.subItems.map((si, idx) => (
                        <p key={idx} className="text-[10px] text-muted-foreground leading-tight">
                          <span className="font-bold uppercase text-[9px] text-primary/70">{si.slotName}:</span> {si.name}
                        </p>
                      ))}
                    </div>
                  )}
                  <p
                    style={{
                      color: "var(--accent)",
                      fontSize: 15,
                      fontWeight: 700,
                      marginTop: 4,
                    }}
                  >
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() =>
                      updateCartQuantity(item.productId, item.quantity - 1)
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background:
                        item.quantity === 1
                          ? "rgba(230,57,70,0.1)"
                          : "var(--muted)",
                      border: `1px solid ${
                        item.quantity === 1
                          ? "var(--destructive)"
                          : "var(--border)"
                      }`,
                      color:
                        item.quantity === 1
                          ? "var(--destructive)"
                          : "var(--muted-foreground)",
                      cursor: "pointer",
                    }}
                  >
                    {item.quantity === 1 ? (
                      <Trash2 size={14} />
                    ) : (
                      <Minus size={14} />
                    )}
                  </motion.button>
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 15,
                      fontWeight: 700,
                      minWidth: 24,
                      textAlign: "center",
                    }}
                  >
                    {item.quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() =>
                      updateCartQuantity(item.productId, item.quantity + 1)
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: "var(--secondary)",
                      border: "1px solid var(--primary)",
                      color: "var(--primary)",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Promo Code */}
        {!activeCoupon ? (
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag
                  size={14}
                  color="var(--muted-foreground)"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                />
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Cupom de desconto"
                  className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.boxShadow = "var(--shadow-focus)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                className="px-5 py-3 rounded-xl font-bold transition-all"
                style={{
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  boxShadow: "var(--shadow-default)"
                }}
              >
                Aplicar
              </button>
            </div>
            {couponError && (
              <p className="text-destructive text-xs mt-2 flex items-center gap-1 font-medium">
                <XCircle size={12} /> {couponError}
              </p>
            )}

            {coupons.filter(c => c.active).length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px dashed var(--border)" }}>
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Cupons Disponíveis</h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {coupons.filter(c => c.active).map(coupon => (
                    <button 
                      key={coupon.id} 
                      onClick={() => { 
                        setCouponInput(coupon.code); 
                        const success = applyCoupon(coupon.code);
                        if (!success) setCouponError("Cupom inválido, expirado ou não aplicável.");
                        else setCouponError("");
                      }}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl transition-all border-none bg-primary/10 hover:bg-primary/20 cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                        <Tag size={10} />
                      </div>
                      <div className="text-left pr-1">
                        <div className="text-xs font-black text-primary leading-tight">{coupon.code}</div>
                        <div className="text-[10px] font-semibold text-primary/70 leading-tight">
                          {coupon.type === "percentage" ? `${coupon.value}% OFF` : coupon.type === "shipping" ? "Frete Grátis" : `R$ ${coupon.value.toFixed(2)} OFF`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 rounded-xl mb-6 bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Percent size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-primary uppercase">{activeCoupon.code}</span>
                  <CheckCircle2 size={14} className="text-primary" />
                </div>
                <span className="text-xs text-primary/80 font-bold tracking-wide uppercase">
                  Cupom Aplicado
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary font-black">-{formatCurrency(discountAmount)}</span>
              <button 
                onClick={removeCoupon}
                className="text-muted-foreground hover:text-destructive transition-colors bg-transparent border-none cursor-pointer"
                title="Remover cupom"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div
          className="rounded-xl p-6 mb-4"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <h3
            className="mb-4"
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            Observações do Pedido
          </h3>
          <textarea
            placeholder="Ex: Retirar talheres, campainha estragada, tirar cebola de todos os itens..."
            className="w-full p-4 rounded-xl border border-border bg-background-soft outline-none focus:border-primary transition-all text-sm resize-none"
            rows={3}
            style={{ color: "var(--text-primary)" }}
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>

        {/* Order Summary */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <h3
            className="mb-4"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Resumo
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Subtotal ({cartCount} itens)
              </span>
              <span style={{ color: "var(--text-primary)", fontSize: 14 }}>
                {formatCurrency(cartTotal)}
              </span>
            </div>
            {activeCoupon && discountAmount > 0 && (
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--primary)", fontSize: 14, fontWeight: 600 }}>
                  Desconto ({activeCoupon.code})
                </span>
                <span style={{ color: "var(--primary)", fontSize: 14, fontWeight: 600 }}>
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Taxa de entrega
              </span>
              <span style={{ color: activeCoupon?.type === "shipping" ? "var(--primary)" : "var(--text-primary)", fontSize: 14 }}>
                {activeCoupon?.type === "shipping" ? "Grátis" : formatCurrency(deliveryFee)}
              </span>
            </div>
          </div>
          <div
            className="flex items-center justify-between mt-4 pt-4"
            style={{ borderTop: "1px solid var(--border-light)" }}
          >
            <span
              style={{
                color: "var(--text-primary)",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Total
            </span>
            <span
              style={{
                color: "var(--accent)",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {formatCurrency(total)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
              ⏱ Estimativa: 35–50 minutos
            </span>
          </div>
        </div>

        {/* Checkout CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (!currentUser) {
              navigate("/register");
            } else {
              navigate("/checkout");
            }
          }}
          className="w-full py-4 rounded-xl flex items-center justify-between px-6 mb-3"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            cursor: "pointer",
            boxShadow: "var(--shadow-hover)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--primary-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--primary)")
          }
        >
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            Finalizar Pedido
          </span>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              {formatCurrency(total)}
            </span>
            <ChevronRight size={18} />
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/menu")}
          className="w-full py-3 rounded-xl"
          style={{
            background: "transparent",
            color: "var(--muted-foreground)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Continuar Comprando
        </motion.button>
      </div>
    </div>
  );
}
