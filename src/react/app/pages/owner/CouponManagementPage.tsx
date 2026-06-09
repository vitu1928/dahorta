import React, { useState, useMemo } from "react";
import { useApp } from "../../store/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Tag, TrendingDown, Users, Calendar, Trash2, Edit3, X, Percent, DollarSign, Truck, Gift, Ban, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Coupon, CouponType } from "../../store/mockData";

const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CouponManagementPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useApp();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: "",
    type: "percentage",
    value: 0,
    active: true,
  });

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  // Lógica de cálculo básico para demonstração do impacto
  const analytics = useMemo(() => {
    const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);
    const activeCount = coupons.filter(c => c.active).length;
    const totalVolume = coupons.reduce((sum, c) => sum + (c.totalSalesVolume || 0), 0);

    return { totalUses, activeCount, totalVolume };
  }, [coupons]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    const couponData = {
      code: newCoupon.code,
      type: newCoupon.type as CouponType,
      value: newCoupon.value || 0,
      active: true,
      usedCount: 0,
      totalSalesVolume: 0,
      minOrderValue: newCoupon.minOrderValue,
      expirationDate: newCoupon.expirationDate,
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, couponData);
    } else {
      addCoupon(couponData);
    }

    setIsCreatorOpen(false);
    setEditingCoupon(null);
    setNewCoupon({ code: "", type: "percentage", value: 0, active: true });
  };

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      active: coupon.active,
      minOrderValue: coupon.minOrderValue,
      expirationDate: coupon.expirationDate,
    });
    setIsCreatorOpen(true);
  };

  const handleOpenCreator = () => {
    setEditingCoupon(null);
    setNewCoupon({ code: "", type: "percentage", value: 0, active: true });
    setIsCreatorOpen(true);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "percentage": return <Percent size={18} />;
      case "fixed": return <DollarSign size={18} />;
      case "first_buy": return <Users size={18} />;
      case "shipping": return <Truck size={18} />;
      case "bogo": return <Gift size={18} />;
      case "inactive": return <Ban size={18} />;
      default: return <Tag size={18} />;
    }
  };

  const formatValueLabel = (c: Coupon) => {
    if (c.type === "percentage") return `${c.value}% OFF`;
    if (c.type === "fixed" || c.type === "first_buy") return formatCurrency(c.value);
    if (c.type === "bogo") return "Leve 2 pague 1";
    if (c.type === "shipping") return "Frete Grátis";
    return `${c.value}`;
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto text-foreground">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cupons e Promoções</h1>
          <p className="text-muted-foreground">Gerencie as ofertas e acompanhe o impacto nas vendas.</p>
        </div>
        <button
          onClick={handleOpenCreator}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold transition-all hover:bg-primary/90 border-none cursor-pointer"
        >
          <Plus size={20} />
          Criar Cupom
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Cupons Ativos</p>
            <h3 className="text-2xl font-black">{analytics.activeCount}</h3>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-[#E9C46A]/20 flex items-center justify-center text-[#E9C46A]">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Total de Usos</p>
            <h3 className="text-2xl font-black">{analytics.totalUses}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Volume de Vendas</p>
            <h3 className="text-2xl font-black">{formatCurrency(analytics.totalVolume)}</h3>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar pelo código do cupom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm text-foreground"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredCoupons.map((coupon) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-all bg-background/50"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${coupon.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {getIconForType(coupon.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg leading-tight uppercase tracking-wide">{coupon.code}</h4>
                    {!coupon.active && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-bold uppercase">Inativo</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatValueLabel(coupon)} • Usado {coupon.usedCount}x
                  </p>
                </div>
                <div className="ml-8 pr-8 border-r border-border min-w-[120px]">
                  <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Volume Vendas</p>
                  <p className="font-bold text-sm text-primary">{formatCurrency(coupon.totalSalesVolume || 0)}</p>
                </div>
                <div className="ml-6 pr-8 border-r border-border min-w-[100px]">
                  <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Ticket Médio</p>
                  <p className="font-bold text-sm">
                    {coupon.usedCount > 0 ? formatCurrency((coupon.totalSalesVolume || 0) / coupon.usedCount) : "R$ 0,00"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">
                    {coupon.minOrderValue ? `Mín: ${formatCurrency(coupon.minOrderValue)}` : "Sem mínimo"}
                  </div>
                  <div className={coupon.expirationDate && coupon.expirationDate < new Date() ? "text-destructive" : "text-muted-foreground"}>
                    {coupon.expirationDate ? `Exp: ${format(coupon.expirationDate, "dd/MM", { locale: ptBR })}` : "Sem validade"}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(coupon)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-card border border-border text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => deleteCoupon(coupon.id)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-card border border-border text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredCoupons.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">Nenhum cupom encontrado.</div>
          )}
        </div>
      </div>

      {/* Editor Lateral */}
      <AnimatePresence>
        {isCreatorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatorOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl flex flex-col border-l border-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold">{editingCoupon ? "Editar Cupom" : "Criar Novo Cupom"}</h2>
                <button
                  onClick={() => setIsCreatorOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-muted text-muted-foreground rounded-full hover:bg-muted/80 border-none cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="couponForm" onSubmit={handleSave} className="space-y-6 text-sm">
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Código do Cupom</label>
                    <input
                      type="text"
                      required
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                      placeholder="Ex: VERAO20"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card outline-none focus:border-primary uppercase font-bold tracking-widest text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Tipo de Desconto</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["percentage", "fixed", "first_buy", "shipping", "bogo"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewCoupon({ ...newCoupon, type: type as CouponType, value: 0 })}
                          className="flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition-all"
                          style={{
                            borderColor: newCoupon.type === type ? "var(--primary)" : "var(--border)",
                            background: newCoupon.type === type ? "var(--primary)" : "var(--card)",
                            color: newCoupon.type === type ? "var(--primary-foreground)" : "var(--foreground)",
                          }}
                        >
                          {getIconForType(type)}
                          <span className="font-semibold capitalize text-sm">{
                            type === "percentage" ? "% Off" :
                            type === "fixed" ? "R$ Fixo" :
                            type === "first_buy" ? "1ª Compra" :
                            type === "shipping" ? "FreteGrátis" : "Leve 2 Pague 1"
                          }</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {newCoupon.type !== "shipping" && newCoupon.type !== "bogo" && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Valor do Desconto</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {newCoupon.type === "percentage" ? <Percent size={16}/> : "R$"}
                        </span>
                        <input
                          type="number"
                          required
                          value={newCoupon.value || ""}
                          onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) })}
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card outline-none text-foreground"
                        />
                      </div>
                    </div>
                  )}

                  <hr className="border-border my-6" />
                  
                  <h3 className="font-bold text-base mb-4">Restrições</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-muted-foreground">Pedido Mínimo (R$)</label>
                      <input
                        type="number"
                        value={newCoupon.minOrderValue || ""}
                        onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="Ex: 50.00"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card outline-none text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-muted-foreground">Validade</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-card outline-none text-foreground text-sm"
                        onChange={(e) => setNewCoupon({ ...newCoupon, expirationDate: e.target.value ? new Date(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-xl flex items-start gap-3 text-xs text-muted-foreground">
                    <Calendar size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <p>Cupons programados para reengajamento podem ser enviados via notificação se o usuário estiver há mais de 30 dias inativo.</p>
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-border bg-card">
                <button
                  type="submit"
                  form="couponForm"
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black cursor-pointer border-none shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                  Salvar Cupom
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
