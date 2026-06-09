import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Edit2,
  Trash2,
  History,
  Filter,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import { StockItem, InsumoUnit } from "../../store/mockData";

const formatUnit = (unit: InsumoUnit) => {
  const units: Record<InsumoUnit, string> = {
    g: "g",
    kg: "kg",
    ml: "ml",
    l: "L",
    un: "un",
    fatia: "fatias",
    folha: "folhas",
    colher: "colheres",
    porção: "porções",
  };
  return units[unit] || unit;
};

export default function InventoryPage() {
  const { stockItems, stockMovements, addStockItem, updateStockItem, deleteStockItem, addStockMovement, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState<Partial<StockItem>>({});
  const [movementData, setMovementData] = useState({
    type: "entry" as "entry" | "exit_manual",
    quantity: 0,
    notes: "",
  });

  const categories = Array.from(new Set(stockItems.map((item) => item.category)));

  const filtered = stockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = stockItems.filter(
    (item) => item.currentQuantity <= item.minAlert
  );

  const handleAddItem = () => {
    if (!formData.name || !formData.category || !formData.unit) return;
    addStockItem({
      name: formData.name,
      category: formData.category,
      unit: formData.unit as InsumoUnit,
      currentQuantity: formData.currentQuantity || 0,
      maxCapacity: formData.maxCapacity || 0,
      minAlert: formData.minAlert || 0,
      yieldRule: formData.yieldRule,
    });
    setShowAddModal(false);
    setFormData({});
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    updateStockItem(selectedItem.id, formData);
    setShowEditModal(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleAddMovement = () => {
    if (!selectedItem || !currentUser) return;
    addStockMovement({
      stockItemId: selectedItem.id,
      type: movementData.type,
      quantity: movementData.quantity,
      userId: currentUser.id,
      userName: currentUser.name,
      notes: movementData.notes,
    });
    setShowMovementModal(false);
    setSelectedItem(null);
    setMovementData({ type: "entry", quantity: 0, notes: "" });
  };

  const openEditModal = (item: StockItem) => {
    setSelectedItem(item);
    setFormData(item);
    setShowEditModal(true);
  };

  const openMovementModal = (item: StockItem) => {
    setSelectedItem(item);
    setShowMovementModal(true);
  };

  const openHistoryModal = (item: StockItem) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
  };

  const getStockStatus = (item: StockItem) => {
    const percentage = (item.currentQuantity / item.maxCapacity) * 100;
    if (item.currentQuantity <= item.minAlert) return { color: "#E63946", label: "Crítico" };
    if (percentage < 30) return { color: "#F77F00", label: "Baixo" };
    if (percentage < 70) return { color: "#06B6D4", label: "Normal" };
    return { color: "#22c55e", label: "Bom" };
  };

  return (
    <div className="p-6 lg:p-8" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Gerenciamento de Estoque
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {filtered.length} itens no estoque · {lowStockItems.length} em alerta
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={18} />
          Adicionar Item
        </button>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl mb-6 flex items-start gap-3"
          style={{
            background: "rgba(230,57,70,0.1)",
            border: "1px solid var(--destructive)",
          }}
        >
          <AlertTriangle size={20} color="var(--destructive)" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p style={{ color: "var(--destructive)", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {lowStockItems.length} {lowStockItems.length === 1 ? "item em" : "itens em"} estado crítico
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              {lowStockItems.map((item) => item.name).join(", ")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            color="var(--muted-foreground)"
            className="absolute left-4 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar item..."
            className="w-full pl-11 pr-4 py-3 rounded-xl outline-none"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: 14,
            }}
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
          <Filter size={16} color="var(--muted-foreground)" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-sm cursor-pointer"
            style={{ color: "var(--text-primary)" }}
          >
            <option value="all">Todas categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const status = getStockStatus(item);
          const percentage = (item.currentQuantity / item.maxCapacity) * 100;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-xl"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={16} color="var(--primary)" />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--muted-foreground)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                    {item.name}
                  </h3>
                </div>
                <div
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    background: `${status.color}20`,
                    color: status.color,
                  }}
                >
                  {status.label}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>
                    {item.currentQuantity}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                    / {item.maxCapacity} {formatUnit(item.unit)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: status.color,
                    }}
                  />
                </div>
              </div>

              {item.yieldRule && (
                <div
                  className="p-2.5 rounded-lg mb-4 text-xs"
                  style={{
                    background: "var(--muted)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <strong>Rendimento:</strong> {item.yieldRule.baseUnit} ≈{" "}
                  {item.yieldRule.yields} {formatUnit(item.yieldRule.yieldsUnit)}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openMovementModal(item)}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                  style={{
                    background: "rgba(76,124,89,0.1)",
                    color: "var(--primary)",
                    border: "1px solid var(--primary)",
                    cursor: "pointer",
                  }}
                >
                  <TrendingUp size={14} />
                  Movimentar
                </button>
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-lg"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => openHistoryModal(item)}
                  className="p-2 rounded-lg"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <History size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja realmente excluir "${item.name}"?`)) {
                      deleteStockItem(item.id);
                    }
                  }}
                  className="p-2 rounded-lg"
                  style={{
                    background: "rgba(230,57,70,0.1)",
                    color: "var(--destructive)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Modals */}
      {(showAddModal || showEditModal) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setFormData({});
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full p-6 rounded-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              {showAddModal ? "Adicionar Item" : "Editar Item"}
            </h2>
            <div className="space-y-4">
              <input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do item"
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <select
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Selecione a categoria</option>
                <option value="hortifruti">Hortifruti</option>
                <option value="proteína">Proteína</option>
                <option value="grãos">Grãos</option>
                <option value="molhos">Molhos</option>
                <option value="temperos">Temperos</option>
                <option value="secos">Secos</option>
              </select>
              <select
                value={formData.unit || ""}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as InsumoUnit })}
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Unidade</option>
                <option value="g">Gramas (g)</option>
                <option value="kg">Quilogramas (kg)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="l">Litros (L)</option>
                <option value="un">Unidades (un)</option>
                <option value="fatia">Fatias</option>
                <option value="folha">Folhas</option>
                <option value="porção">Porções</option>
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  value={formData.currentQuantity || ""}
                  onChange={(e) => setFormData({ ...formData, currentQuantity: Number(e.target.value) })}
                  placeholder="Qtd atual"
                  className="px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <input
                  type="number"
                  value={formData.maxCapacity || ""}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                  placeholder="Máximo"
                  className="px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <input
                  type="number"
                  value={formData.minAlert || ""}
                  onChange={(e) => setFormData({ ...formData, minAlert: Number(e.target.value) })}
                  placeholder="Mín alerta"
                  className="px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: "var(--input-background)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setFormData({});
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold"
                  style={{
                    background: "var(--muted)",
                    color: "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={showAddModal ? handleAddItem : handleEditItem}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showAddModal ? "Adicionar" : "Salvar"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => {
            setShowMovementModal(false);
            setSelectedItem(null);
            setMovementData({ type: "entry", quantity: 0, notes: "" });
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full p-6 rounded-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Movimentar Estoque
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
              {selectedItem.name}
            </p>
            <div className="space-y-4">
              <div className="flex gap-2 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
                {[
                  { value: "entry", label: "Entrada", icon: <TrendingUp size={16} /> },
                  { value: "exit_manual", label: "Saída", icon: <TrendingDown size={16} /> },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setMovementData({ ...movementData, type: type.value as "entry" | "exit_manual" })}
                    className="flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm"
                    style={{
                      background: movementData.type === type.value ? "var(--primary)" : "transparent",
                      color: movementData.type === type.value ? "var(--primary-foreground)" : "var(--text-secondary)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={movementData.quantity || ""}
                onChange={(e) => setMovementData({ ...movementData, quantity: Number(e.target.value) })}
                placeholder={`Quantidade (${formatUnit(selectedItem.unit)})`}
                className="w-full px-4 py-3 rounded-xl outline-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <textarea
                value={movementData.notes}
                onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
                placeholder="Observações (opcional)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMovementModal(false);
                    setSelectedItem(null);
                    setMovementData({ type: "entry", quantity: 0, notes: "" });
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold"
                  style={{
                    background: "var(--muted)",
                    color: "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMovement}
                  disabled={!movementData.quantity}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold"
                  style={{
                    background: movementData.quantity ? "var(--primary)" : "var(--muted)",
                    color: movementData.quantity ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    border: "none",
                    cursor: movementData.quantity ? "pointer" : "not-allowed",
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => {
            setShowHistoryModal(false);
            setSelectedItem(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full p-6 rounded-2xl max-h-[80vh] overflow-y-auto"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Histórico de Movimentação
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
              {selectedItem.name}
            </p>
            <div className="space-y-3">
              {stockMovements
                .filter((m) => m.stockItemId === selectedItem.id)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((movement) => (
                  <div
                    key={movement.id}
                    className="p-4 rounded-xl"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {movement.type === "entry" ? (
                          <TrendingUp size={16} color="var(--success)" />
                        ) : (
                          <TrendingDown size={16} color="var(--destructive)" />
                        )}
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color:
                              movement.type === "entry"
                                ? "var(--success)"
                                : "var(--destructive)",
                          }}
                        >
                          {movement.type === "entry"
                            ? "Entrada"
                            : movement.type === "exit_auto"
                            ? "Saída Automática"
                            : movement.type === "adjustment"
                            ? "Ajuste"
                            : "Saída Manual"}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color:
                            movement.type === "entry"
                              ? "var(--success)"
                              : "var(--destructive)",
                        }}
                      >
                        {movement.type === "entry" ? "+" : ""}
                        {movement.quantity} {formatUnit(selectedItem.unit)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      <p>{movement.userName}</p>
                      <p>{new Date(movement.timestamp).toLocaleString("pt-BR")}</p>
                      {movement.notes && <p className="mt-1 italic">{movement.notes}</p>}
                      {movement.orderId && (
                        <p className="mt-1 font-semibold">Pedido: {movement.orderId}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}