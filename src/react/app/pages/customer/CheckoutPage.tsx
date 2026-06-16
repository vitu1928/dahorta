import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft, MapPin, CreditCard, Smartphone, DollarSign,
  Wallet, ChevronRight, Check, AlertCircle, MessageSquare,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import { PaymentMethod, Address } from "../../store/mockData";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "pix", label: "PIX", icon: <Smartphone size={20} />, description: "Aprovação instantânea" },
  { id: "credit_card", label: "Cartão de Crédito", icon: <CreditCard size={20} />, description: "Visa, Mastercard, Elo" },
  { id: "debit_card", label: "Cartão de Débito", icon: <Wallet size={20} />, description: "Visa, Mastercard" },
  { id: "meal_voucher", label: "Vale Refeição", icon: <CreditCard size={20} />, description: "VR, Alelo, Sodexo, Flash" },
  { id: "cash", label: "Dinheiro", icon: <DollarSign size={20} />, description: "Troco se necessário" },
];

export default function CheckoutPage() {
  const { cart, cartTotal, deliveryFee, placeOrder, currentUser, orderNotes, activeCoupon, discountAmount } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/register", { replace: true });
    }
  }, [currentUser, navigate]);

  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [address, setAddress] = useState<Address>({
    id: "new",
    label: "Casa",
    street: "Rua das Palmeiras",
    number: "123",
    complement: "Apto 45",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    zipCode: "05422-000",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [addressNotes, setAddressNotes] = useState("");
  const [change, setChange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cartTotal - discountAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.street || !address.number || !address.neighborhood) {
      setError("Preencha o endereço completo.");
      setStep("address");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const order = placeOrder(paymentMethod, address, orderNotes, addressNotes);
    setLoading(false);
    if (order) {
      toast.success("Pedido realizado com sucesso!");
      navigate(`/orders`);
    }
  };

  const fieldStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    fontSize: "14px",
    borderRadius: "12px",
  };

  const steps = ["address", "payment", "confirm"];
  const stepIndex = steps.indexOf(step);

  return (
    <div style={{ color: "var(--foreground)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => step === "address" ? navigate("/cart") : setStep(steps[stepIndex - 1] as any)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--foreground)" }}>
            Finalizar Pedido
          </h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "address", label: "Endereço", icon: <MapPin size={14} /> },
          { key: "payment", label: "Pagamento", icon: <CreditCard size={14} /> },
          { key: "confirm", label: "Confirmar", icon: <Check size={14} /> },
        ].map((s, i) => {
          const isActive = s.key === step;
          const isDone = stepIndex > i;
          return (
            <div key={s.key} style={{ display: "contents" }}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: isDone ? "#4CAF50" : isActive ? "var(--primary)" : "var(--muted)",
                    border: `2px solid ${isDone ? "#4CAF50" : isActive ? "var(--primary)" : "var(--border)"}`,
                    color: isDone || isActive ? "white" : "var(--muted-foreground)",
                  }}
                >
                  {isDone ? <Check size={16} /> : s.icon}
                </div>
                <span style={{ fontSize: "10px", color: isActive ? "var(--primary)" : isDone ? "#4CAF50" : "var(--muted-foreground)", fontWeight: isActive ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className="flex-1 h-0.5 mx-2" style={{ background: isDone ? "#4CAF50" : "var(--border)" }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl mb-4"
            style={{ background: "rgba(196,69,54,0.08)", border: "1px solid rgba(196,69,54,0.25)" }}
          >
            <AlertCircle size={16} color="var(--destructive)" />
            <span style={{ color: "var(--destructive)", fontSize: "13px" }}>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Address */}
          {step === "address" && (
            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-5">
                <MapPin size={18} color="var(--primary)" />
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>
                  Endereço de Entrega
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>CEP</label>
                  <input value={address.zipCode} onChange={(e) => setAddress((p) => ({ ...p, zipCode: e.target.value }))} placeholder="00000-000" className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Rua / Avenida *</label>
                    <input required value={address.street} onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))} placeholder="Rua das Flores" className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                  </div>
                  <div>
                    <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Número *</label>
                    <input required value={address.number} onChange={(e) => setAddress((p) => ({ ...p, number: e.target.value }))} placeholder="123" className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                  </div>
                </div>
                <div>
                  <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Complemento</label>
                  <input value={address.complement} onChange={(e) => setAddress((p) => ({ ...p, complement: e.target.value }))} placeholder="Apto, Bloco, Casa..." className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
                <div>
                  <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Bairro *</label>
                  <input required value={address.neighborhood} onChange={(e) => setAddress((p) => ({ ...p, neighborhood: e.target.value }))} placeholder="Jardim Paulista" className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
                <div>
                  <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Cidade</label>
                  <input value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
                <div>
                  <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Observações de ponto de referência (opcional)</label>
                  <textarea value={addressNotes} onChange={(e) => setAddressNotes(e.target.value)} placeholder="Ex: Casa verde, portão preto, interfone 2..." rows={2} className="w-full px-4 py-2.5 outline-none resize-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!address.street || !address.number || !address.neighborhood) {
                    setError("Preencha os campos obrigatórios (*).");
                  } else {
                    setError("");
                    setStep("payment");
                  }
                }}
                className="w-full py-4 rounded-2xl flex items-center justify-between px-5 font-bold mt-5"
                style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "15px" }}
              >
                Continuar para Pagamento
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={18} color="var(--primary)" />
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>
                  Forma de Pagamento
                </h2>
              </div>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
                    style={{
                      background: paymentMethod === opt.id ? "rgba(212,116,95,0.1)" : "var(--card)",
                      border: `2px solid ${paymentMethod === opt.id ? "var(--primary)" : "var(--border)"}`,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: paymentMethod === opt.id ? "var(--primary)" : "var(--border)",
                        color: paymentMethod === opt.id ? "white" : "var(--muted-foreground)",
                      }}
                    >
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <div style={{ color: "var(--foreground)", fontSize: "14px", fontWeight: 600 }}>{opt.label}</div>
                      <div style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{opt.description}</div>
                    </div>
                    {paymentMethod === opt.id && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
                        <Check size={14} color="white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {paymentMethod === "cash" && (
                <div className="mt-3">
                  <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>
                    Troco para quanto?
                  </label>
                  <input
                    value={change}
                    onChange={(e) => setChange(e.target.value)}
                    placeholder="Ex: R$ 100,00"
                    className="w-full px-4 py-2.5 outline-none"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: "14px", borderRadius: "12px" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              )}

              <button
                onClick={() => setStep("confirm")}
                className="w-full py-4 rounded-2xl flex items-center justify-between px-5 font-bold mt-5"
                style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "15px" }}
              >
                Revisar Pedido
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--foreground)", marginBottom: "16px" }}>
                Revisar Pedido
              </h2>

              <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <h4 style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                  Itens
                </h4>
                {cart.map((item) => (
                  <div key={item.productId} className="flex flex-col py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ color: "var(--primary)", fontSize: "12px", fontWeight: 700 }}>{item.quantity}x</span>
                        <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{item.name}</span>
                      </div>
                      <span style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="ml-6 space-y-0.5 mt-1">
                        {item.subItems.map((si, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] text-muted-foreground opacity-75">
                            <span className="font-bold uppercase text-[9px] text-primary/70">{si.slotName}:</span> {si.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} color="var(--primary)" />
                  <h4 style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Endereço</h4>
                </div>
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.5 }}>
                  {address.street}, {address.number}{address.complement && `, ${address.complement}`}
                  <br />{address.neighborhood}, {address.city}
                </p>
              </div>

              <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={14} color="var(--primary)" />
                  <h4 style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pagamento</h4>
                </div>
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{PAYMENT_OPTIONS.find((o) => o.id === paymentMethod)?.label}</p>
              </div>

              {orderNotes && (
                <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} color="var(--primary)" />
                    <h4 style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Observações do pedido</h4>
                  </div>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{orderNotes}</p>
                </div>
              )}

              {addressNotes && (
                <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} color="var(--primary)" />
                    <h4 style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Observações de ponto de referência</h4>
                  </div>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{addressNotes}</p>
                </div>
              )}

              <div className="rounded-2xl p-4 mb-6 space-y-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Subtotal</span>
                  <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{formatCurrency(cartTotal)}</span>
                </div>
                {activeCoupon && discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--primary)", fontSize: "13px", fontWeight: 600 }}>Desconto ({activeCoupon.code})</span>
                    <span style={{ color: "var(--primary)", fontSize: "13px", fontWeight: 600 }}>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Entrega</span>
                  <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--foreground)", fontSize: "15px", fontWeight: 700 }}>Total</span>
                  <span style={{ color: "var(--primary)", fontSize: "18px", fontWeight: 800 }}>{formatCurrency(total)}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold"
                style={{
                  background: loading ? "var(--secondary)" : "var(--primary)",
                  color: "white",
                  border: "none",
                  cursor: loading ? "wait" : "pointer",
                  fontSize: "16px",
                }}
              >
                {loading ? (
                  <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Check size={20} />
                    Confirmar Pedido — {formatCurrency(total)}
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}