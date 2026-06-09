import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Pencil, Trash2, Search, Clock, ToggleLeft, ToggleRight, X, Check,
  ImageIcon, ChevronDown, DollarSign, TrendingUp, AlertCircle, Package,
  ArrowLeft, Percent, ChefHat, Calendar, Layers,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Product, TechnicalSheetIngredient, TechnicalSheet, InsumoUnit } from "../../store/mockData";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const DAYS_OF_WEEK = [
  { id: 0, name: "Domingo" },
  { id: 1, name: "Segunda-feira" },
  { id: 2, name: "Terça-feira" },
  { id: 3, name: "Quarta-feira" },
  { id: 4, name: "Quinta-feira" },
  { id: 5, name: "Sexta-feira" },
  { id: 6, name: "Sábado" },
];

const UNITS: InsumoUnit[] = ["g", "kg", "ml", "l", "un", "fatia", "folha", "colher"];

const fieldStyle = {
  background: "var(--input-background)", border: "1px solid var(--border)",
  color: "var(--text-primary)", fontSize: "14px", borderRadius: "10px",
};

// ─── Cost Panel ────────────────────────────────────────────────────────────────
interface CostPanelProps {
  sheet: Partial<TechnicalSheet>;
  desiredMargin: number;
  manualPrice: number;
}

function CostPanel({ sheet, desiredMargin, manualPrice }: CostPanelProps) {
  const { calculateIngredientCost } = useApp();

  const totalCost = useMemo(() => {
    if (!sheet.ingredients || sheet.ingredients.length === 0) return 0;
    return sheet.ingredients.reduce((sum, ing) => {
      if (!ing.insumoId) return sum;
      const { total } = calculateIngredientCost(ing as TechnicalSheetIngredient);
      return sum + total;
    }, 0);
  }, [sheet.ingredients, calculateIngredientCost]);

  const suggestedPrice = desiredMargin > 0 && desiredMargin < 100 && totalCost > 0
    ? totalCost / (1 - desiredMargin / 100)
    : 0;

  const finalPrice = manualPrice > 0 ? manualPrice : suggestedPrice;
  const realMargin = finalPrice > 0 && totalCost > 0
    ? ((finalPrice - totalCost) / finalPrice) * 100
    : 0;
  const profit = finalPrice - totalCost;

  const marginColor = realMargin >= 40 ? "#22c55e" : realMargin >= 25 ? "#eab308" : "#ef4444";
  const marginLabel = realMargin >= 40 ? "Margem Saudável" : realMargin >= 25 ? "Margem Média" : "Margem Baixa";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-default)" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--secondary)" }}>
        <div className="flex items-center gap-2">
          <DollarSign size={16} color="var(--primary)" />
          <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Calculadora de Custos</h3>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "11px", marginTop: "2px" }}>Atualizado em tempo real</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Custo total da receita</span>
          <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 700 }}>{formatCurrency(totalCost)}</span>
        </div>
        <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Preço sugerido ({desiredMargin}% margem)</span>
          <span style={{ color: "var(--primary)", fontSize: "15px", fontWeight: 700 }}>{suggestedPrice > 0 ? formatCurrency(suggestedPrice) : "—"}</span>
        </div>
        {manualPrice > 0 && (
          <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Preço manual definido</span>
            <span style={{ color: "var(--warning)", fontSize: "15px", fontWeight: 700 }}>{formatCurrency(manualPrice)}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border-light)" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Margem real calculada</span>
          <span style={{ color: marginColor, fontSize: "15px", fontWeight: 700 }}>{realMargin > 0 ? `${realMargin.toFixed(1)}%` : "—"}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Lucro por venda</span>
          <span style={{ color: profit > 0 ? "var(--success)" : "var(--destructive)", fontSize: "15px", fontWeight: 700 }}>{profit > 0 ? formatCurrency(profit) : "—"}</span>
        </div>

        {/* Margin indicator */}
        {realMargin > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: marginColor + "15", border: `1px solid ${marginColor}30` }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: marginColor }} />
            <span style={{ color: marginColor, fontSize: "12px", fontWeight: 600 }}>{marginLabel}</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "11px", marginLeft: "auto" }}>{realMargin.toFixed(1)}%</span>
          </motion.div>
        )}

        {totalCost === 0 && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
            <AlertCircle size={14} color="var(--muted-foreground)" />
            <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>Adicione ingredientes para calcular</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ingredient Row ────────────────────────────────────────────────────────────
interface IngredientRowProps {
  ingredient: Partial<TechnicalSheetIngredient> & { id: string };
  onChange: (id: string, field: string, value: string | number) => void;
  onRemove: (id: string) => void;
}

function IngredientRow({ ingredient, onChange, onRemove }: IngredientRowProps) {
  const { insumos, suppliers, calculateIngredientCost, getBestPrice } = useApp();
  const selectedInsumo = insumos.find((i) => i.id === ingredient.insumoId);

  const cost = useMemo(() => {
    if (!ingredient.insumoId || !ingredient.quantity) return null;
    return calculateIngredientCost(ingredient as TechnicalSheetIngredient);
  }, [ingredient, calculateIngredientCost]);

  const selectStyle = { ...fieldStyle, cursor: "pointer", paddingLeft: "8px", paddingRight: "24px", paddingTop: "8px", paddingBottom: "8px", appearance: "none" as const };

  return (
    <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
      <td className="px-3 py-2" style={{ minWidth: "160px" }}>
        <div className="relative">
          <select
            value={ingredient.insumoId ?? ""} onChange={(e) => onChange(ingredient.id, "insumoId", e.target.value)}
            className="w-full outline-none" style={selectStyle}
          >
            <option value="">Selecione...</option>
            {insumos.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <ChevronDown size={12} color="var(--muted-foreground)" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </td>
      <td className="px-3 py-2" style={{ minWidth: "80px" }}>
        <input
          type="number" min="0" step="0.1" value={ingredient.quantity ?? ""}
          onChange={(e) => onChange(ingredient.id, "quantity", parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-2 outline-none text-center" style={fieldStyle}
        />
      </td>
      <td className="px-3 py-2" style={{ minWidth: "70px" }}>
        <div className="relative">
          <select value={ingredient.unit ?? selectedInsumo?.unit ?? "g"} onChange={(e) => onChange(ingredient.id, "unit", e.target.value)}
            className="w-full outline-none" style={selectStyle}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <ChevronDown size={12} color="var(--muted-foreground)" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </td>
      <td className="px-3 py-2" style={{ minWidth: "140px" }}>
        <div className="relative">
          <select value={ingredient.supplierId ?? ""} onChange={(e) => onChange(ingredient.id, "supplierId", e.target.value)}
            className="w-full outline-none" style={selectStyle}>
            <option value="">Auto (melhor)</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name.split(" ").slice(0, 2).join(" ")}</option>)}
          </select>
          <ChevronDown size={12} color="var(--muted-foreground)" className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </td>
      <td className="px-3 py-2 text-center" style={{ minWidth: "90px" }}>
        <span style={{ color: cost ? "var(--text-secondary)" : "var(--muted-foreground)", fontSize: "12px" }}>
          {cost ? formatCurrency(cost.unitPrice) : "—"}
        </span>
      </td>
      <td className="px-3 py-2 text-right" style={{ minWidth: "90px" }}>
        <span style={{ color: cost && cost.total > 0 ? "var(--primary)" : "var(--muted-foreground)", fontSize: "13px", fontWeight: 700 }}>
          {cost && cost.total > 0 ? formatCurrency(cost.total) : "—"}
        </span>
      </td>
      <td className="px-3 py-2">
        <button onClick={() => onRemove(ingredient.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.2)", color: "var(--destructive)", cursor: "pointer" }}>
          <X size={13} />
        </button>
      </td>
    </tr>
  );
}

// ─── Product Form ──────────────────────────────────────────────────────────────
interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSave: (data: Omit<Product, "id">, sheet: Partial<TechnicalSheet> | null) => void;
}

function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const { categories, getTechnicalSheetByProduct } = useApp();
  const existingSheet = product ? getTechnicalSheetByProduct(product.id) : undefined;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    internalName: product?.internalName ?? "",
    description: product?.description ?? "",
    image: product?.image ?? "",
    price: product?.price ?? 0,
    category: product?.category ?? categories[0]?.id ?? "",
    available: product?.available ?? true,
    prepTime: product?.prepTime ?? 15,
    featured: product?.featured ?? false,
    desiredMargin: product?.desiredMargin ?? 40,
  });

  const [ingredients, setIngredients] = useState<(Partial<TechnicalSheetIngredient> & { id: string })[]>(
    existingSheet?.ingredients.map((i) => ({ ...i })) ?? []
  );

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: `tmp_${Date.now()}`, insumoId: "", quantity: 0, unit: "g" as InsumoUnit },
    ]);
  };

  const updateIngredient = (id: string, field: string, value: string | number) => {
    setIngredients((prev) => prev.map((ing) => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients = ingredients.filter((i) => i.insumoId && i.quantity);
    const sheet = validIngredients.length > 0 ? {
      internalName: form.internalName,
      desiredMargin: form.desiredMargin,
      ingredients: validIngredients as TechnicalSheetIngredient[],
    } : null;
    onSave(form, sheet);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ background: "var(--card)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
              {product ? "Editar Produto" : "Novo Produto"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Ficha Técnica Integrada</p>
          </div>
        </div>
        <button type="submit" form="product-form"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all hover:brightness-95"
          style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
          <Check size={16} />{product ? "Salvar Alterações" : "Criar Produto"}
        </button>
      </div>

      {/* Body */}
      <form id="product-form" onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
        {/* Left: Form + Ficha Técnica */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Geral */}
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-default)" }}>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={18} color="var(--primary)" /> Informações Gerais
            </h3>
            <div className="space-y-4">
              {/* Image Preview */}
              {form.image && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border">
                  <ImageWithFallback src={form.image} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }} />
                </div>
              )}
              <div>
                <label>URL da Imagem</label>
                <div className="relative mt-1">
                  <input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://..."
                    className="w-full px-4 py-2.5 outline-none pl-10" style={fieldStyle} />
                  <ImageIcon size={14} color="var(--muted-foreground)" className="absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Nome no Cardápio *</label>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Ex: Bowl de Falafel"
                    className="w-full px-4 py-2.5 outline-none mt-1" style={fieldStyle} />
                </div>
                <div>
                  <label>Nome Interno</label>
                  <input value={form.internalName} onChange={(e) => setForm((p) => ({ ...p, internalName: e.target.value }))} placeholder="BOWL-FAL-01"
                    className="w-full px-4 py-2.5 outline-none mt-1" style={fieldStyle} />
                </div>
              </div>
              <div>
                <label>Descrição do Cardápio</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Ingredientes e sabores..." rows={2}
                  className="w-full px-4 py-2.5 outline-none resize-none mt-1" style={fieldStyle} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>Categoria</label>
                  <div className="relative mt-1">
                    <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-2.5 outline-none appearance-none pr-10" style={{ ...fieldStyle, cursor: "pointer" }}>
                      {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                    </select>
                    <ChevronDown size={14} color="var(--muted-foreground)" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label>Preço de Venda (R$)</label>
                  <input type="number" step="0.01" min="0" value={form.price || ""} onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00" className="w-full px-4 py-2.5 outline-none mt-1 font-bold" style={fieldStyle} />
                </div>
                <div>
                  <label>Margem Alvo (%)</label>
                  <div className="relative mt-1">
                    <input type="number" min="0" max="99" value={form.desiredMargin} onChange={(e) => setForm((p) => ({ ...p, desiredMargin: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 outline-none pr-10" style={fieldStyle} />
                    <Percent size={14} color="var(--muted-foreground)" className="absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Tempo de Preparo (min)</label>
                  <input type="number" min="1" value={form.prepTime} onChange={(e) => setForm((p) => ({ ...p, prepTime: parseInt(e.target.value) || 15 }))}
                    className="w-full px-4 py-2.5 outline-none mt-1" style={fieldStyle} />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between px-4 py-2 rounded-xl h-[42px]" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Disponível p/ venda</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
                      style={{ color: form.available ? "var(--success)" : "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}>
                      {form.available ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha Técnica */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-default)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div className="flex items-center gap-2">
                <ChefHat size={18} color="var(--primary)" />
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>Ficha Técnica</h3>
              </div>
              <button type="button" onClick={addIngredient}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all"
                style={{ background: "var(--secondary)", border: "1px solid var(--primary)", color: "var(--primary)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                <Plus size={14} /> Adicionar Ingrediente
              </button>
            </div>

            <div className="overflow-x-auto">
              {ingredients.length > 0 ? (
                <table className="w-full" style={{ minWidth: "640px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                      {["Ingrediente", "Qtd.", "Unidade", "Fornecedor", "Custo Unit.", "Custo Total", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3" style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", background: "var(--background-soft)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ing) => (
                      <IngredientRow key={ing.id} ingredient={ing} onChange={updateIngredient} onRemove={removeIngredient} />
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center">
                  <Package size={32} color="var(--border)" className="mx-auto mb-3" />
                  <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Nenhum ingrediente adicionado</p>
                  <button type="button" onClick={addIngredient}
                    className="mt-4 flex items-center gap-2 px-5 py-2 rounded-xl mx-auto"
                    style={{ background: "var(--background-soft)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}>
                    <Plus size={14} /> Começar Ficha Técnica
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cost Calculator Panel */}
        <div className="hidden xl:block w-80 p-6 overflow-y-auto" style={{ borderLeft: "1px solid var(--border-light)", background: "var(--background-soft)", flexShrink: 0 }}>
          <CostPanel
            sheet={{ ingredients: ingredients as TechnicalSheetIngredient[] }}
            desiredMargin={form.desiredMargin}
            manualPrice={form.price}
          />
        </div>
      </form>
    </div>
  );
}

function ComboModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  const { products, addProduct, updateProduct } = useApp();
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [image, setImage] = useState(product?.image ?? "");
  const [slots, setSlots] = useState<{ id: string; name: string; products: string[] }[]>(
    product?.comboSlots?.map(s => ({ ...s })) ?? []
  );

  const addSlot = () => {
    setSlots([...slots, { id: `slot_${Date.now()}`, name: "Novo Slot", products: [] }]);
  };

  const updateSlot = (id: string, field: string, value: any) => {
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const toggleProductInSlot = (slotId: string, productId: string) => {
    setSlots(slots.map(s => {
      if (s.id !== slotId) return s;
      const isIncluded = s.products.includes(productId);
      return {
        ...s,
        products: isIncluded ? s.products.filter(id => id !== productId) : [...s.products, productId]
      };
    }));
  };

  const handleSave = () => {
    if (!name || slots.length === 0) return;
    const data = {
      name,
      description,
      price,
      image,
      category: "combos",
      available: true,
      prepTime: 20,
      featured: product?.featured ?? false,
      isCombo: true,
      comboSlots: slots
    };

    if (product) {
      updateProduct(product.id, data);
    } else {
      addProduct(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted border border-border text-muted-foreground cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold">{product ? "Editar Combo" : "Criar Novo Combo"}</h2>
        </div>
        <button onClick={handleSave} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold border-none cursor-pointer">
          {product ? "Salvar Alterações" : "Salvar Combo"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 p-6 space-y-6 overflow-y-auto border-r border-border">
          <h3 className="flex items-center gap-2 font-bold text-base"><Package size={18} /> Dados do Combo</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nome do Combo</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-card" placeholder="Ex: Combo Família" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Preço Final (R$)</label>
              <input type="number" value={price || ""} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full p-3 rounded-xl border border-border bg-card" placeholder="Valores fixos..." />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">URL da Imagem</label>
              <input value={image} onChange={e => setImage(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-card" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Descrição Curta</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-card h-24 resize-none" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base flex items-center gap-2"><Layers size={18} /> Configuração de Itens (Slots)</h3>
            <button onClick={addSlot} className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary border border-primary rounded-xl font-bold text-sm cursor-pointer">
              <Plus size={16} /> Adicionar Slot
            </button>
          </div>

          <div className="space-y-6">
            {slots.map(slot => (
              <div key={slot.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <input 
                    value={slot.name} 
                    onChange={e => updateSlot(slot.id, "name", e.target.value)}
                    className="font-bold text-sm uppercase bg-transparent border-none outline-none focus:text-primary transition-colors"
                  />
                  <button onClick={() => removeSlot(slot.id)} className="text-destructive p-2 rounded-lg hover:bg-destructive/5 border-none bg-transparent cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {products.filter(p => !p.isCombo).map(p => (
                    <button
                      key={p.id}
                      onClick={() => toggleProductInSlot(slot.id, p.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${slot.products.includes(p.id) ? 'border-primary bg-primary/5 shadow-inner' : 'border-border bg-card'}`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={p.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-bold line-clamp-1 flex-1">{p.name}</span>
                      {slot.products.includes(p.id) && <Check size={14} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {slots.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground">
                <Layers size={32} className="mx-auto mb-3 opacity-30" />
                <p>Nenhum slot criado. Adicione um slot para compor o combo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlateOfDayConfig() {
  const { products, plateOfDay, updatePlateOfDay } = useApp();

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {DAYS_OF_WEEK.map((day) => (
          <div 
            key={day.id} 
            className="flex items-center gap-6 p-4 rounded-2xl bg-white border border-border"
          >
            <div className="w-40">
              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{day.name}</span>
            </div>
            <div className="flex-1 relative">
              <select
                value={plateOfDay[day.id] || ""}
                onChange={(e) => updatePlateOfDay(day.id, e.target.value)}
                className="w-full px-4 py-2.5 outline-none appearance-none pr-10"
                style={fieldStyle}
              >
                <option value="">Selecione um prato...</option>
                {products.filter(p => p.available).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={14} color="var(--muted-foreground)" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {plateOfDay[day.id] && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-border">
                <ImageWithFallback 
                  src={products.find(p => p.id === plateOfDay[day.id])?.image || ""} 
                  alt="preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MenuManagementPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, toggleProductAvailability, saveTechnicalSheet, deleteTechnicalSheet, getTechnicalSheetByProduct, calculateSheetCost } = useApp();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "plateOfDay" | "combos">("menu");
  const [showComboModal, setShowComboModal] = useState(false);
  const [editCombo, setEditCombo] = useState<Product | undefined>();

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? `${cat.icon} ${cat.name}` : catId;
  };

  const handleSave = (data: Omit<Product, "id">, sheet: Partial<TechnicalSheet> | null) => {
    let productId: string;
    if (editProduct) {
      updateProduct(editProduct.id, data);
      productId = editProduct.id;
    } else {
      productId = addProduct(data);
    }
    if (sheet) {
      saveTechnicalSheet({ ...sheet as TechnicalSheet, productId, id: editProduct ? getTechnicalSheetByProduct(editProduct.id)?.id : undefined });
    } else if (editProduct) {
      deleteTechnicalSheet(editProduct.id);
    }
    setShowForm(false);
    setEditProduct(undefined);
  };

  if (showForm || (editProduct !== undefined && showForm !== false)) {
    return (
      <ProductForm
        product={editProduct}
        onClose={() => { setShowForm(false); setEditProduct(undefined); }}
        onSave={handleSave}
      />
    );
  }

  if (showComboModal || editCombo) {
    return (
      <ComboModal
        product={editCombo}
        onClose={() => { setShowComboModal(false); setEditCombo(undefined); }}
      />
    );
  }

  return (
    <div className="p-6 lg:p-10 min-h-screen" style={{ color: "var(--foreground)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <p className="overline-label mb-2" style={{ color: "var(--primary)", fontWeight: 700, letterSpacing: "0.1em" }}>GESTÃO DE CARDÁPIO</p>
          <h1 className="display-heading" style={{ fontSize: 32, color: "var(--text-primary)", fontFamily: "'Poppins', sans-serif" }}>Cardápio</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>Configure seus produtos, preços e fichas técnicas.</p>
        </div>
        <button onClick={() => { 
          if (activeTab === "combos") {
            setEditCombo(undefined);
            setShowComboModal(true);
          } else {
            setEditProduct(undefined); 
            setShowForm(true); 
          }
        }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:scale-[1.02]"
          style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 600, boxShadow: "var(--shadow-default)" }}>
          <Plus size={20} /> {activeTab === "combos" ? "Adicionar Combo" : "Adicionar Produto"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-border">
        <button 
          onClick={() => setActiveTab("menu")}
          className="pb-4 px-2 text-sm font-bold transition-all relative"
          style={{ 
            color: activeTab === "menu" ? "var(--primary)" : "var(--muted-foreground)",
            cursor: "pointer",
            background: "none",
            border: "none"
          }}
        >
          Lista de Produtos
          {activeTab === "menu" && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("plateOfDay")}
          className="pb-4 px-2 text-sm font-bold transition-all relative flex items-center gap-2"
          style={{ 
            color: activeTab === "plateOfDay" ? "var(--primary)" : "var(--muted-foreground)",
            cursor: "pointer",
            background: "none",
            border: "none"
          }}
        >
          <Calendar size={16} />
          Prato do Dia
          {activeTab === "plateOfDay" && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("combos")}
          className="pb-4 px-2 text-sm font-bold transition-all relative flex items-center gap-2"
          style={{ 
            color: activeTab === "combos" ? "var(--primary)" : "var(--muted-foreground)",
            cursor: "pointer",
            background: "none",
            border: "none"
          }}
        >
          <Layers size={16} />
          Combos
          {activeTab === "combos" && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
      </div>

      {activeTab === "menu" ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} color="var(--muted-foreground)" className="absolute left-4 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou descrição..."
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all border border-border"
                style={{ background: "var(--card)", color: "var(--text-primary)", fontSize: "15px" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setFilterCat("all")} className="px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0"
                style={{ background: filterCat === "all" ? "var(--primary)" : "var(--card)", color: filterCat === "all" ? "white" : "var(--text-secondary)", border: filterCat === "all" ? "none" : "1px solid var(--border)", cursor: "pointer", fontWeight: 600 }}>
                Todos
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setFilterCat(cat.id)} className="px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0"
                  style={{ background: filterCat === cat.id ? "var(--primary)" : "var(--card)", color: filterCat === cat.id ? "white" : "var(--text-secondary)", border: filterCat === cat.id ? "none" : "1px solid var(--border)", cursor: "pointer", fontWeight: 600 }}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filtered.map((product) => {
                const sheet = getTechnicalSheetByProduct(product.id);
                const cost = sheet ? calculateSheetCost(sheet) : null;
                const margin = cost && product.price > 0 ? ((product.price - cost) / product.price) * 100 : null;
                const marginColor = margin !== null ? (margin >= 40 ? "var(--success)" : margin >= 25 ? "var(--warning)" : "var(--destructive)") : "var(--muted-foreground)";

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative rounded-2xl overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                    onClick={() => { 
                      if (product.isCombo) {
                        setEditCombo(product);
                        setShowComboModal(true);
                      } else {
                        setEditProduct(product); 
                        setShowForm(true); 
                      }
                    }}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {product.featured && (
                          <div className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>Estrela</div>
                        )}
                        <div className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider" style={{ background: product.available ? "var(--success)" : "var(--destructive)", color: "white" }}>
                          {product.available ? "Ativo" : "Pausado"}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span style={{ color: "var(--muted-foreground)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{getCategoryName(product.category)}</span>
                        <span style={{ color: "var(--primary)", fontSize: "14px", fontWeight: 800 }}>{formatCurrency(product.price)}</span>
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{product.name}</h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "12px", lineHeight: 1.4, height: "34px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{product.description}</p>

                      <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-between">
                        <div className="flex flex-col">
                          <span style={{ color: "var(--muted-foreground)", fontSize: "9px", fontWeight: 600 }}>MARGEM REAL</span>
                          <span style={{ color: marginColor, fontSize: "13px", fontWeight: 700 }}>{margin !== null ? `${margin.toFixed(1)}%` : "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { 
                            e.stopPropagation(); 
                            if (product.isCombo) {
                              setEditCombo(product);
                              setShowComboModal(true);
                            } else {
                              setEditProduct(product); 
                              setShowForm(true); 
                            }
                          }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-muted" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "transparent", cursor: "pointer" }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={(e) => { 
                            e.stopPropagation(); 
                            if (window.confirm("Deseja realmente excluir este item?")) {
                              deleteProduct(product.id);
                            }
                          }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-destructive/10 hover:text-destructive" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "transparent", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      ) : activeTab === "plateOfDay" ? (
        <PlateOfDayConfig />
      ) : activeTab === "combos" ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2"><ChefHat size={20} className="text-primary" /> Combos Modulares</h2>
            <button 
              onClick={() => {
                setEditCombo(undefined);
                setShowComboModal(true);
              }}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 border-none cursor-pointer hover:bg-primary/90 transition-all"
            >
              <Plus size={20} /> Novo Combo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.filter(p => p.isCombo).map(combo => (
              <motion.div
                key={combo.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="h-32 relative">
                  <ImageWithFallback src={combo.image} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-[10px] font-black uppercase">
                    {formatCurrency(combo.price)}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-base mb-1">{combo.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{combo.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{combo.comboSlots?.length} SLOTS</span>
                    <div className="flex-1 border-t border-border-light h-px" />
                    <button onClick={() => {
                      setEditCombo(combo);
                      setShowComboModal(true);
                    }} className="text-muted-foreground hover:text-primary transition-colors border-none bg-transparent cursor-pointer">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => {
                      if (window.confirm("Deseja realmente excluir este combo?")) {
                        deleteProduct(combo.id);
                      }
                    }} className="text-muted-foreground hover:text-destructive transition-colors border-none bg-transparent cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {products.filter(p => p.isCombo).length === 0 && (
              <div className="md:col-span-3 py-20 text-center border-2 border-dashed border-border rounded-[40px] text-muted-foreground">
                <ChefHat size={40} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium text-base">Nenhum combo cadastrado.</p>
                <p className="text-sm mt-1">Crie combos para facilitar a escolha do cliente.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {(showComboModal || editCombo) && (
          <ComboModal
            product={editCombo}
            onClose={() => { setShowComboModal(false); setEditCombo(undefined); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
