import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, Search, X, Check, ChevronDown, Package,
  TrendingUp, TrendingDown, DollarSign, Edit2, Star, Calendar,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import { Insumo, InsumoUnit, PriceRecord } from "../../store/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const UNITS: InsumoUnit[] = ["g", "kg", "ml", "l", "un", "fatia", "folha", "colher"];
const CATEGORIES = ["Carnes", "Panificação", "Laticínios", "Hortifruti", "Congelados", "Molhos", "Bebidas", "Outros"];

const fieldStyle = {
  background: "var(--muted)", border: "1px solid var(--border)",
  color: "var(--foreground)", fontSize: "14px", borderRadius: "10px",
};

interface InsumoFormProps {
  insumo?: Insumo;
  onClose: () => void;
  onSave: (data: Omit<Insumo, "id">) => void;
}

function InsumoForm({ insumo, onClose, onSave }: InsumoFormProps) {
  const [form, setForm] = useState({
    name: insumo?.name ?? "",
    unit: insumo?.unit ?? "g" as InsumoUnit,
    category: insumo?.category ?? "Outros",
    observations: insumo?.observations ?? "",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>
            {insumo ? "Editar Insumo" : "Novo Insumo"}
          </h3>
          <button onClick={onClose} style={{ color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Nome do Insumo *</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Blend Bovino 180g" className="w-full px-4 py-2.5 outline-none" style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Unidade de Compra</label>
              <div className="relative">
                <select value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value as InsumoUnit }))}
                  className="w-full px-4 py-2.5 outline-none appearance-none pr-10" style={{ ...fieldStyle, cursor: "pointer" }}>
                  {UNITS.map((u) => <option key={u} value={u} style={{ background: "var(--card)" }}>{u}</option>)}
                </select>
                <ChevronDown size={14} color="var(--muted-foreground)" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Categoria</label>
              <div className="relative">
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 outline-none appearance-none pr-10" style={{ ...fieldStyle, cursor: "pointer" }}>
                  {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: "var(--card)" }}>{c}</option>)}
                </select>
                <ChevronDown size={14} color="var(--muted-foreground)" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Observações</label>
            <textarea value={form.observations} onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))}
              placeholder="Notas internas..." rows={2} className="w-full px-4 py-2.5 outline-none resize-none" style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer", fontSize: "14px" }}>Cancelar</button>
            <button disabled={!form.name} onClick={() => { if (form.name) { onSave(form); onClose(); } }}
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
              style={{ background: form.name ? "var(--primary)" : "var(--muted)", color: form.name ? "white" : "var(--muted-foreground)", border: "none", cursor: form.name ? "pointer" : "not-allowed", fontSize: "14px", fontWeight: 600 }}>
              <Check size={16} />{insumo ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface PriceRecordFormProps {
  insumoId: string;
  onClose: () => void;
}

function PriceRecordForm({ insumoId, onClose }: PriceRecordFormProps) {
  const { suppliers, addPriceRecord } = useApp();
  const [form, setForm] = useState({
    supplierId: suppliers[0]?.id ?? "",
    value: "",
    date: new Date().toISOString().split("T")[0],
    observation: "",
  });

  const handleSave = () => {
    if (!form.supplierId || !form.value || !form.date) return;
    addPriceRecord({
      insumoId,
      supplierId: form.supplierId,
      value: parseFloat(form.value),
      date: new Date(form.date + "T12:00:00"),
      observation: form.observation || undefined,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--foreground)" }}>Registrar Preço</h3>
          <button onClick={onClose} style={{ color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "5px" }}>Fornecedor</label>
            <div className="relative">
              <select value={form.supplierId} onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
                className="w-full px-4 py-2.5 outline-none appearance-none pr-10" style={{ ...fieldStyle, cursor: "pointer" }}>
                {suppliers.map((s) => <option key={s.id} value={s.id} style={{ background: "var(--card)" }}>{s.name}</option>)}
              </select>
              <ChevronDown size={14} color="var(--muted-foreground)" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "5px" }}>Preço por Unidade (R$)</label>
              <input type="number" step="0.001" min="0" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                placeholder="0,00" className="w-full px-4 py-2.5 outline-none" style={fieldStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "5px" }}>Data</label>
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-2.5 outline-none" style={{ ...fieldStyle, colorScheme: "dark" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
          </div>
          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "5px" }}>Observação (opcional)</label>
            <input value={form.observation} onChange={(e) => setForm((p) => ({ ...p, observation: e.target.value }))}
              placeholder="Ex: Promoção de fim de mês" className="w-full px-4 py-2.5 outline-none" style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer", fontSize: "14px" }}>Cancelar</button>
            <button onClick={handleSave} disabled={!form.value || !form.supplierId}
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
              style={{ background: form.value ? "var(--primary)" : "var(--muted)", color: form.value ? "white" : "var(--muted-foreground)", border: "none", cursor: form.value ? "pointer" : "not-allowed", fontSize: "14px", fontWeight: 600 }}>
              <Check size={16} />Registrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function InsumoManagementPage() {
  const { insumos, addInsumo, updateInsumo, deleteInsumo, priceRecords, suppliers, getBestPrice, pricePeriodDays } = useApp();
  const [search, setSearch] = useState("");
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editInsumo, setEditInsumo] = useState<Insumo | undefined>();
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = insumos.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const getInsumoRecords = (insumoId: string) =>
    priceRecords.filter((r) => r.insumoId === insumoId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getSupplierName = (supplierId: string) =>
    suppliers.find((s) => s.id === supplierId)?.name ?? supplierId;

  const getCategoryColor = (cat?: string) => {
    const map: Record<string, string> = {
      "Carnes": "#ef4444", "Panificação": "#f97316", "Laticínios": "#eab308",
      "Hortifruti": "#22c55e", "Congelados": "#3b82f6", "Molhos": "#a855f7",
    };
    return map[cat ?? ""] ?? "#737373";
  };

  const chartData = useMemo(() => {
    if (!selectedInsumo) return [];
    const records = getInsumoRecords(selectedInsumo.id);
    const byMonth: Record<string, Record<string, number>> = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
      if (!byMonth[key]) byMonth[key] = {};
      const supName = getSupplierName(r.supplierId).split(" ")[0];
      if (!byMonth[key][supName] || r.value < byMonth[key][supName]) {
        byMonth[key][supName] = r.value;
      }
    });
    return Object.entries(byMonth).reverse().slice(0, 6).reverse().map(([month, sup]) => ({ month, ...sup }));
  }, [selectedInsumo, priceRecords]);

  const supplierColors = ["#d4745f", "#3b82f6", "#22c55e", "#a855f7"];
  const chartSuppliers = useMemo(() => {
    if (!selectedInsumo) return [];
    const ids = [...new Set(getInsumoRecords(selectedInsumo.id).map((r) => r.supplierId))];
    return ids.map((id, i) => ({ id, name: getSupplierName(id).split(" ")[0], color: supplierColors[i % supplierColors.length] }));
  }, [selectedInsumo, priceRecords]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ color: "var(--foreground)" }}>
      <AnimatePresence>
        {(showForm || editInsumo) && (
          <InsumoForm
            insumo={editInsumo}
            onClose={() => { setShowForm(false); setEditInsumo(undefined); }}
            onSave={(data) => { if (editInsumo) updateInsumo(editInsumo.id, data); else addInsumo(data); }}
          />
        )}
        {showPriceForm && selectedInsumo && (
          <PriceRecordForm insumoId={selectedInsumo.id} onClose={() => setShowPriceForm(false)} />
        )}
      </AnimatePresence>

      {/* Left Panel - Insumo List */}
      <div className="w-full lg:w-80 flex flex-col overflow-hidden" style={{ borderRight: "1px solid var(--border)", flexShrink: 0 }}>
        <div className="p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.5px" }}>Insumos</h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{insumos.length} cadastrados</p>
            </div>
            <button onClick={() => { setEditInsumo(undefined); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
              <Plus size={16} />Novo
            </button>
          </div>
          <div className="relative">
            <Search size={15} color="var(--muted-foreground)" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar insumo..."
              className="w-full pl-9 pr-4 py-2 rounded-xl outline-none"
              style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: "13px" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filtered.map((insumo) => {
            const best = getBestPrice(insumo.id);
            const isSelected = selectedInsumo?.id === insumo.id;
            return (
              <motion.div
                key={insumo.id}
                onClick={() => setSelectedInsumo(isSelected ? null : insumo)}
                className="p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? "rgba(212,116,95,0.1)" : "var(--card)",
                  border: `1px solid ${isSelected ? "rgba(212,116,95,0.3)" : "var(--border)"}`,
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: getCategoryColor(insumo.category) + "20", color: getCategoryColor(insumo.category), fontSize: "10px" }}>
                        {insumo.category ?? "Outros"}
                      </span>
                    </div>
                    <p style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{insumo.name}</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "11px", marginTop: "1px" }}>Unidade: {insumo.unit}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {best ? (
                      <p style={{ color: "#22c55e", fontSize: "12px", fontWeight: 700 }}>
                        {formatCurrency(best.value)}<span style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>/{insumo.unit}</span>
                      </p>
                    ) : (
                      <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Sem preço</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>{getInsumoRecords(insumo.id).length} registros</span>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditInsumo(insumo); }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}>
                      <Edit2 size={11} />
                    </button>
                    {deleteConfirm === insumo.id ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); deleteInsumo(insumo.id); if (selectedInsumo?.id === insumo.id) setSelectedInsumo(null); setDeleteConfirm(null); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer" }}>
                          <Check size={11} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}>
                          <X size={11} />
                        </button>
                      </>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(insumo.id); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Package size={32} color="var(--border)" className="mx-auto mb-3" />
              <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Nenhum insumo encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Price History */}
      <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
        {selectedInsumo ? (
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="p-6" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: getCategoryColor(selectedInsumo.category) + "20", color: getCategoryColor(selectedInsumo.category), fontWeight: 600 }}>
                      {selectedInsumo.category}
                    </span>
                    <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>Unidade: {selectedInsumo.unit}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 700, color: "var(--foreground)" }}>{selectedInsumo.name}</h2>
                  {selectedInsumo.observations && <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>{selectedInsumo.observations}</p>}
                </div>
                <button onClick={() => setShowPriceForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                  <Plus size={16} />Registrar Preço
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Best Price Summary */}
              <div className="grid grid-cols-3 gap-4">
                {(() => {
                  const best = getBestPrice(selectedInsumo.id);
                  const records = getInsumoRecords(selectedInsumo.id);
                  const lastRecord = records[0];
                  const supplierCounts = [...new Set(records.map((r) => r.supplierId))].length;
                  return (
                    <>
                      <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Star size={14} color="#22c55e" />
                          <span style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Melhor Preço</span>
                        </div>
                        <p style={{ color: "#22c55e", fontSize: "22px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {best ? formatCurrency(best.value) : "—"}
                        </p>
                        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", marginTop: "2px" }}>
                          {best ? getSupplierName(best.supplierId).split(" ").slice(0, 2).join(" ") : "Sem registro"}
                        </p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} color="var(--primary)" />
                          <span style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Último Registro</span>
                        </div>
                        <p style={{ color: "var(--primary)", fontSize: "18px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {lastRecord ? formatCurrency(lastRecord.value) : "—"}
                        </p>
                        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", marginTop: "2px" }}>
                          {lastRecord ? formatDate(lastRecord.date) : "Sem registro"}
                        </p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Package size={14} color="#3b82f6" />
                          <span style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Fornecedores</span>
                        </div>
                        <p style={{ color: "#3b82f6", fontSize: "22px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{supplierCounts}</p>
                        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", marginTop: "2px" }}>Período: {pricePeriodDays} dias</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Price Chart */}
              {chartData.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "var(--foreground)", marginBottom: "16px" }}>
                    Variação de Preço por Fornecedor
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v.toFixed(2)}`} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)", fontSize: "12px" }} formatter={(v: number) => [formatCurrency(v)]} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "var(--muted-foreground)" }} />
                      {chartSuppliers.map((s) => (
                        <Line key={s.id} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={2} dot={{ fill: s.color, r: 3 }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Price History Table */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "var(--foreground)" }}>Histórico de Preços</h3>
                </div>
                <div className="overflow-x-auto">
                  {getInsumoRecords(selectedInsumo.id).length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          {["Data", "Fornecedor", "Preço/Unidade", "Observação", ""].map((h) => (
                            <th key={h} className="text-left px-5 py-3" style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getInsumoRecords(selectedInsumo.id).map((record, i) => {
                          const best = getBestPrice(selectedInsumo.id);
                          const isBest = best?.value === record.value && best?.supplierId === record.supplierId && i === 0;
                          return (
                            <tr key={record.id} style={{ borderBottom: "1px solid var(--border)" }}>
                              <td className="px-5 py-3" style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{formatDate(record.date)}</td>
                              <td className="px-5 py-3" style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{getSupplierName(record.supplierId)}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <span style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 600 }}>{formatCurrency(record.value)}</span>
                                  {isBest && <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: "10px" }}>Melhor</span>}
                                </div>
                              </td>
                              <td className="px-5 py-3" style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{record.observation ?? "—"}</td>
                              <td className="px-5 py-3">
                                <button onClick={() => { /* delete */ }} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}>
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-10 text-center">
                      <DollarSign size={28} color="var(--border)" className="mx-auto mb-2" />
                      <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Nenhum preço registrado</p>
                      <button onClick={() => setShowPriceForm(true)} className="mt-3 px-4 py-2 rounded-xl" style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "13px" }}>
                        Registrar primeiro preço
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package size={48} color="var(--border)" className="mx-auto mb-4" />
              <h3 style={{ color: "var(--muted-foreground)", fontSize: "16px", fontWeight: 600 }}>Selecione um insumo</h3>
              <p style={{ color: "var(--border)", fontSize: "13px", marginTop: "6px" }}>Clique em um insumo para ver o histórico de preços</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}