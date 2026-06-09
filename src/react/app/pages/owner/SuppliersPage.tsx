import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Trash2, X, Check, ChevronDown, Truck, Phone, Mail,
  MapPin, Star, TrendingDown, Edit2, ChevronRight, Package,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import { Supplier } from "../../store/mockData";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });

const fieldStyle = {
  background: "var(--muted)", border: "1px solid var(--border)",
  color: "var(--foreground)", fontSize: "14px", borderRadius: "10px",
};

interface SupplierFormProps {
  supplier?: Supplier;
  onClose: () => void;
  onSave: (data: Omit<Supplier, "id">) => void;
}

function SupplierForm({ supplier, onClose, onSave }: SupplierFormProps) {
  const [form, setForm] = useState({
    name: supplier?.name ?? "",
    cnpj: supplier?.cnpj ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    address: supplier?.address ?? "",
  });

  const handleSave = () => {
    if (!form.name) return;
    onSave(form);
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
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>
            {supplier ? "Editar Fornecedor" : "Novo Fornecedor"}
          </h3>
          <button onClick={onClose} style={{ color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Nome do Fornecedor *</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Distribuidora Prime Foods"
              className="w-full px-4 py-2.5 outline-none" style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>CNPJ (opcional)</label>
              <input value={form.cnpj} onChange={(e) => setForm((p) => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00"
                className="w-full px-4 py-2.5 outline-none" style={fieldStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Telefone</label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="(11) 0000-0000"
                className="w-full px-4 py-2.5 outline-none" style={fieldStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
          </div>
          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="contato@fornecedor.com.br"
              className="w-full px-4 py-2.5 outline-none" style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Endereço</label>
            <div className="relative">
              <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Rua, número - Bairro, Cidade"
                className="w-full px-4 py-2.5 outline-none pl-10" style={fieldStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
              <MapPin size={14} color="var(--muted-foreground)" className="absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer", fontSize: "14px" }}>Cancelar</button>
            <button onClick={handleSave} disabled={!form.name}
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
              style={{ background: form.name ? "var(--primary)" : "var(--muted)", color: form.name ? "white" : "var(--muted-foreground)", border: "none", cursor: form.name ? "pointer" : "not-allowed", fontSize: "14px", fontWeight: 600 }}>
              <Check size={16} />{supplier ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, insumos, priceRecords, getBestPrice } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | undefined>();
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getSupplierInsumos = (supplierId: string) => {
    const insumoIds = [...new Set(priceRecords.filter((r) => r.supplierId === supplierId).map((r) => r.insumoId))];
    return insumoIds.map((id) => {
      const insumo = insumos.find((i) => i.id === id);
      const records = priceRecords
        .filter((r) => r.insumoId === id && r.supplierId === supplierId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const best = getBestPrice(id);
      const isCurrentBest = best?.supplierId === supplierId;
      return { insumo, records, isCurrentBest, latestRecord: records[0] };
    }).filter((item) => item.insumo);
  };

  const getSupplierStats = (supplierId: string) => {
    const items = getSupplierInsumos(supplierId);
    const bestCount = items.filter((i) => i.isCurrentBest).length;
    return { totalInsumos: items.length, bestPriceCount: bestCount };
  };

  return (
    <div className="p-6 lg:p-8" style={{ color: "var(--foreground)" }}>
      <AnimatePresence>
        {(showForm || editSupplier) && (
          <SupplierForm
            supplier={editSupplier}
            onClose={() => { setShowForm(false); setEditSupplier(undefined); }}
            onSave={(data) => { if (editSupplier) updateSupplier(editSupplier.id, data); else addSupplier(data); }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="overline-label mb-2">Gestão</p>
          <h1 className="display-heading" style={{ fontSize: 26, color: "var(--foreground)" }}>Fornecedores</h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "2px" }}>{suppliers.length} fornecedores cadastrados</p>
        </div>
        <button onClick={() => { setEditSupplier(undefined); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
          <Plus size={18} />Novo Fornecedor
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Fornecedores", value: suppliers.length, color: "var(--primary)", icon: <Truck size={18} /> },
          { label: "Insumos Mapeados", value: insumos.filter((i) => priceRecords.some((r) => r.insumoId === i.id)).length, color: "#3b82f6", icon: <Package size={18} /> },
          { label: "Registros de Preço", value: priceRecords.length, color: "#22c55e", icon: <TrendingDown size={18} /> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.color === "var(--primary)" ? "rgba(212,116,95,0.18)" : stat.color + "18" }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>
              <span style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500 }}>{stat.label}</span>
            </div>
            <p style={{ color: "var(--foreground)", fontSize: "26px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Suppliers List */}
      <div className="space-y-3">
        {suppliers.map((supplier) => {
          const stats = getSupplierStats(supplier.id);
          const isExpanded = expandedSupplier === supplier.id;
          const supplierInsumos = getSupplierInsumos(supplier.id);

          return (
            <motion.div key={supplier.id} layout className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              {/* Supplier Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() => setExpandedSupplier(isExpanded ? null : supplier.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,116,95,0.12)", border: "1px solid rgba(212,116,95,0.2)" }}>
                    <Truck size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 style={{ color: "var(--foreground)", fontSize: "16px", fontWeight: 700 }}>{supplier.name}</h3>
                    {supplier.cnpj && <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginTop: "1px" }}>CNPJ: {supplier.cnpj}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex gap-4">
                    <div className="text-right">
                      <p style={{ color: "var(--foreground)", fontSize: "16px", fontWeight: 700 }}>{stats.totalInsumos}</p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Insumos</p>
                    </div>
                    <div className="text-right">
                      <p style={{ color: "#22c55e", fontSize: "16px", fontWeight: 700 }}>{stats.bestPriceCount}</p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Melhores preços</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditSupplier(supplier); setShowForm(true); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}>
                      <Edit2 size={14} />
                    </button>
                    {deleteConfirm === supplier.id ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); deleteSupplier(supplier.id); if (expandedSupplier === supplier.id) setExpandedSupplier(null); setDeleteConfirm(null); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer" }}>
                          <Check size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}>
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(supplier.id); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", cursor: "pointer" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground)"; }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                    <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                      <ChevronRight size={18} color="var(--muted-foreground)" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  {/* Contact Row */}
                  <div className="px-5 py-4 flex flex-wrap gap-4" style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                    {supplier.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} color="var(--muted-foreground)" />
                        <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} color="var(--muted-foreground)" />
                        <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{supplier.email}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} color="var(--muted-foreground)" />
                        <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{supplier.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Insumos Table */}
                  <div className="p-5">
                    <h4 style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                      Insumos Fornecidos
                    </h4>
                    {supplierInsumos.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
                        <table className="w-full">
                          <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                              {["Insumo", "Unidade", "Último Preço", "Última Atualização", "Status"].map((h) => (
                                <th key={h} className="text-left px-4 py-3" style={{ color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", background: "var(--muted)" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {supplierInsumos.map(({ insumo, records, isCurrentBest, latestRecord }) => (
                              <tr key={insumo!.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td className="px-4 py-3" style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 500 }}>{insumo!.name}</td>
                                <td className="px-4 py-3" style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{insumo!.unit}</td>
                                <td className="px-4 py-3" style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 600 }}>
                                  {latestRecord ? formatCurrency(latestRecord.value) : "—"}
                                </td>
                                <td className="px-4 py-3" style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>
                                  {latestRecord ? formatDate(latestRecord.date) : "—"}
                                </td>
                                <td className="px-4 py-3">
                                  {isCurrentBest ? (
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontSize: "11px", fontWeight: 600 }}>
                                      <Star size={11} />Melhor Preço
                                    </span>
                                  ) : (
                                    <span style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Não é o melhor</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-6 text-center rounded-xl" style={{ border: "1px dashed var(--border)" }}>
                        <Package size={24} color="var(--border)" className="mx-auto mb-2" />
                        <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Nenhum insumo vinculado</p>
                        <p style={{ color: "var(--border)", fontSize: "12px", marginTop: "4px" }}>Registre preços de insumos para vincular ao fornecedor</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {suppliers.length === 0 && (
          <div className="text-center py-16">
            <Truck size={48} color="var(--border)" className="mx-auto mb-4" />
            <h3 style={{ color: "var(--muted-foreground)", fontSize: "16px", fontWeight: 600 }}>Nenhum fornecedor cadastrado</h3>
            <button onClick={() => setShowForm(true)} className="mt-4 px-5 py-2.5 rounded-xl" style={{ background: "var(--primary)", color: "white", border: "none", cursor: "pointer" }}>
              Adicionar primeiro fornecedor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}