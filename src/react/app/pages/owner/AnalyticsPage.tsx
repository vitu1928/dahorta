import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingBag, DollarSign, Clock, Star, ArrowUpRight, ArrowDownRight,
  ToggleLeft, ToggleRight, TrendingDown, Award, AlertTriangle, Download,
} from "lucide-react";
import { useApp } from "../../store/AppContext";
import { SALES_DATA, TOP_PRODUCTS_DATA, ORDER_STATUS_DATA, MONTHLY_DATA, PRODUCT_COST_DATA, INSUMO_PRICE_TREND } from "../../store/mockData";
import { motion } from "motion/react";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  color: string;
}

function MetricCard({ icon, label, value, change, positive, color }: MetricCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "#2d4a2d", border: "1px solid #3a4e35" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}60, transparent)` }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
          style={{ background: positive ? "rgba(76,175,80,0.1)" : "rgba(214,69,69,0.1)", color: positive ? "#4CAF50" : "#D64545" }}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{change}
        </span>
      </div>
      <div style={{ color: "#f5f1e8", fontSize: "22px", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ color: "#9da89a", fontSize: "11px", marginTop: "4px", letterSpacing: "0.04em" }}>{label}</div>
    </motion.div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#253625", border: "1px solid #3a4e35", borderRadius: "12px", color: "#f5f1e8", fontSize: "12px" },
  cursor: { fill: "rgba(212,116,95,0.05)" },
};

type Tab = "overview" | "costs" | "ratings";

export default function AnalyticsPage() {
  const { orders, restaurantOpen, toggleRestaurant, reviews, products } = useApp();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (activeTab === "overview") {
      exportToCSV(SALES_DATA, "vendas_semanal");
    } else if (activeTab === "costs") {
      exportToCSV(PRODUCT_COST_DATA, "custos_produtos");
    } else if (activeTab === "ratings") {
      const reviewData = reviews.map(r => ({
        id: r.id,
        customer: r.customerName,
        stars: r.stars,
        comment: r.comment || "",
        order: r.orderId
      }));
      exportToCSV(reviewData || [], "avaliacoes");
    }
  };

  const totalFaturamento = orders.reduce((s, o) => s + o.total, 0);
  const ticketMedio = orders.length ? totalFaturamento / orders.length : 0;
  const inProgress = orders.filter((o) => ["received", "preparing", "ready", "delivering"].includes(o.status)).length;
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0;

  const bestProduct = [...PRODUCT_COST_DATA].sort((a, b) => b.margem - a.margem)[0];
  const worstProduct = [...PRODUCT_COST_DATA].sort((a, b) => a.margem - b.margem)[0];
  const avgCost = PRODUCT_COST_DATA.reduce((s, p) => s + p.custo, 0) / PRODUCT_COST_DATA.length;
  const totalFaturamentoProducts = PRODUCT_COST_DATA.reduce((s, p) => s + p.preco * p.vendas, 0);
  const totalLucro = PRODUCT_COST_DATA.reduce((s, p) => s + (p.preco - p.custo) * p.vendas, 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Visão Geral" },
    { id: "costs", label: "Custos & Margens" },
    { id: "ratings", label: "Avaliações" },
  ];

  const cardStyle = { background: "#2d4a2d", border: "1px solid #3a4e35" };

  return (
    <div className="p-6 lg:p-8 space-y-6" style={{ color: "#f5f1e8" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="overline-label mb-2">Inteligência de dados</p>
          <h1 className="display-heading" style={{ fontSize: 28, color: "#000000" }}>Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
            style={{ 
              background: "#3a4e35", 
              border: "1px solid #4a5e45", 
              color: "#f5f1e8",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#4a5e45"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#3a4e35"}
          >
            <Download size={16} />
            CSV
          </button>
          <div className="flex p-1 rounded-xl gap-1" style={{ background: "#253625", border: "1px solid #3a4e35" }}>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-1.5 rounded-lg text-sm transition-all"
                style={{ background: activeTab === tab.id ? "#d4745f" : "transparent", color: activeTab === tab.id ? "white" : "#9da89a", border: "none", cursor: "pointer", fontWeight: 500 }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "#253625", border: "1px solid #3a4e35" }}>
            <span style={{ fontSize: "13px", color: restaurantOpen ? "#4CAF50" : "#D64545" }}>{restaurantOpen ? "Aberto" : "Fechado"}</span>
            <button onClick={toggleRestaurant} style={{ color: restaurantOpen ? "#4CAF50" : "#D64545", background: "none", border: "none", cursor: "pointer" }}>
              {restaurantOpen ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard icon={<DollarSign size={20} />} label="Total Faturado" value={formatCurrency(totalFaturamento)} change="+12.5%" positive color="#d4745f" />
            <MetricCard icon={<ShoppingBag size={20} />} label="Pedidos Hoje" value={String(todayOrders.length || orders.length)} change="+8.2%" positive color="#75B044" />
            <MetricCard icon={<TrendingUp size={20} />} label="Ticket Médio" value={formatCurrency(ticketMedio)} change="+5.7%" positive color="#4CAF50" />
          </div>

          <div className="grid lg:grid-cols-1 gap-4">
            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center justify-between mb-5">
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f5f1e8" }}>Faturamento por Período</h3>
                <div className="flex gap-1 p-1 rounded-lg" style={{ background: "#3a4e35" }}>
                  {(["week", "month"] as const).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className="px-3 py-1 rounded-md text-xs transition-all"
                      style={{ background: period === p ? "#d4745f" : "transparent", color: period === p ? "white" : "#9da89a", border: "none", cursor: "pointer", fontWeight: 500 }}>
                      {p === "week" ? "Semana" : "Meses"}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                {period === "week" ? (
                  <AreaChart data={SALES_DATA}>
                    <defs><linearGradient id="gradTerra" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4745f" stopOpacity={0.3} /><stop offset="95%" stopColor="#d4745f" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a4e35" />
                    <XAxis dataKey="day" tick={{ fill: "#9da89a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9da89a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v), "Faturamento"]} />
                    <Area type="monotone" dataKey="faturamento" stroke="#d4745f" strokeWidth={2} fill="url(#gradTerra)" />
                  </AreaChart>
                ) : (
                  <AreaChart data={MONTHLY_DATA}>
                    <defs><linearGradient id="gradTerra2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4745f" stopOpacity={0.3} /><stop offset="95%" stopColor="#d4745f" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a4e35" />
                    <XAxis dataKey="month" tick={{ fill: "#9da89a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9da89a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v)]} />
                    <Area type="monotone" dataKey="faturamento" stroke="#d4745f" strokeWidth={2} fill="url(#gradTerra2)" />
                    <Area type="monotone" dataKey="lucro" stroke="#4CAF50" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#9da89a" }} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f5f1e8", marginBottom: "20px" }}>Pedidos por Dia da Semana</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={SALES_DATA} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a4e35" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#9da89a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9da89a", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "Pedidos"]} />
                  <Bar dataKey="vendas" fill="#d4745f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f5f1e8", marginBottom: "20px" }}>Produtos Mais Vendidos</h3>
              <div className="space-y-4">
                {TOP_PRODUCTS_DATA.map((product, i) => {
                  const max = TOP_PRODUCTS_DATA[0].pedidos;
                  const pct = (product.pedidos / max) * 100;
                  return (
                    <div key={product.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span style={{ color: "#9da89a", fontSize: "11px", fontWeight: 700, width: "16px" }}>#{i + 1}</span>
                          <span style={{ color: "#9da89a", fontSize: "13px" }}>{product.name}</span>
                        </div>
                        <span style={{ color: "#f5f1e8", fontSize: "12px", fontWeight: 600 }}>{product.pedidos} pedidos</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "#3a4e35" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                          className="h-full rounded-full" style={{ background: product.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── COSTS TAB ── */}
      {activeTab === "costs" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard icon={<DollarSign size={20} />} label="Custo Médio/Produto" value={formatCurrency(avgCost)} change="-3.2%" positive color="#d4745f" />
            <MetricCard icon={<TrendingUp size={20} />} label="Faturamento Total" value={formatCurrency(totalFaturamentoProducts)} change="+11.4%" positive color="#75B044" />
            <MetricCard icon={<TrendingDown size={20} />} label="Lucro Real Estimado" value={formatCurrency(totalLucro)} change="+8.9%" positive color="#4CAF50" />
            <MetricCard icon={<Star size={20} />} label="Margem Média" value={`${(totalLucro / totalFaturamentoProducts * 100).toFixed(1)}%`} change="+2.1%" positive color="#a855f7" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5" style={{ background: "#2d4a2d", border: "1px solid rgba(76,175,80,0.25)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Award size={18} color="#4CAF50" />
                <span style={{ color: "#4CAF50", fontSize: "13px", fontWeight: 600 }}>Produto Mais Lucrativo</span>
              </div>
              <h3 style={{ color: "#f5f1e8", fontSize: "20px", fontWeight: 700 }}>{bestProduct.name}</h3>
              <div className="flex items-center gap-4 mt-3">
                <div><p style={{ color: "#9da89a", fontSize: "11px" }}>Margem</p><p style={{ color: "#4CAF50", fontSize: "18px", fontWeight: 700 }}>{bestProduct.margem.toFixed(1)}%</p></div>
                <div><p style={{ color: "#9da89a", fontSize: "11px" }}>Preço</p><p style={{ color: "#f5f1e8", fontSize: "16px", fontWeight: 600 }}>{formatCurrency(bestProduct.preco)}</p></div>
                <div><p style={{ color: "#9da89a", fontSize: "11px" }}>Custo</p><p style={{ color: "#d4745f", fontSize: "16px", fontWeight: 600 }}>{formatCurrency(bestProduct.custo)}</p></div>
              </div>
            </div>
            <div className="rounded-2xl p-5" style={{ background: "#2d4a2d", border: "1px solid rgba(214,69,69,0.25)" }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} color="#D64545" />
                <span style={{ color: "#D64545", fontSize: "13px", fontWeight: 600 }}>Produto Menos Lucrativo</span>
              </div>
              <h3 style={{ color: "#f5f1e8", fontSize: "20px", fontWeight: 700 }}>{worstProduct.name}</h3>
              <div className="flex items-center gap-4 mt-3">
                <div><p style={{ color: "#9da89a", fontSize: "11px" }}>Margem</p><p style={{ color: "#D64545", fontSize: "18px", fontWeight: 700 }}>{worstProduct.margem.toFixed(1)}%</p></div>
                <div><p style={{ color: "#9da89a", fontSize: "11px" }}>Preço</p><p style={{ color: "#f5f1e8", fontSize: "16px", fontWeight: 600 }}>{formatCurrency(worstProduct.preco)}</p></div>
                <div><p style={{ color: "#9da89a", fontSize: "11px" }}>Custo</p><p style={{ color: "#d4745f", fontSize: "16px", fontWeight: 600 }}>{formatCurrency(worstProduct.custo)}</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={cardStyle}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f5f1e8", marginBottom: "20px" }}>Margem Real por Produto</h3>
            <div className="space-y-4">
              {PRODUCT_COST_DATA.sort((a, b) => b.margem - a.margem).map((product) => {
                const color = product.margem >= 50 ? "#4CAF50" : product.margem >= 35 ? "#F4A261" : "#D64545";
                return (
                  <div key={product.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: "#9da89a", fontSize: "13px" }}>{product.name}</span>
                      <div className="flex items-center gap-3">
                        <span style={{ color: "#9da89a", fontSize: "12px" }}>Custo: {formatCurrency(product.custo)}</span>
                        <span style={{ color, fontSize: "13px", fontWeight: 700 }}>{product.margem.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "#3a4e35" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(product.margem, 100)}%` }} transition={{ duration: 0.8 }}
                        className="h-full rounded-full" style={{ background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={cardStyle}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f5f1e8", marginBottom: "20px" }}>Variação de Preço de Insumos por Categoria</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={INSUMO_PRICE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a4e35" />
                <XAxis dataKey="month" tick={{ fill: "#9da89a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9da89a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v.toFixed(2)}`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v)]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#9da89a" }} />
                <Line type="monotone" dataKey="carnes" name="Carnes (/g)" stroke="#D64545" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="panificacao" name="Panificação (/un)" stroke="#d4745f" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hortifruti" name="Hortifruti (/folha)" stroke="#75B044" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-5" style={cardStyle}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f5f1e8", marginBottom: "20px" }}>Faturamento vs Lucro Real</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4745f" stopOpacity={0.2} /><stop offset="95%" stopColor="#d4745f" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gradLuc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2} /><stop offset="95%" stopColor="#4CAF50" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a4e35" />
                <XAxis dataKey="month" tick={{ fill: "#9da89a", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9da89a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v)]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#9da89a" }} />
                <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#d4745f" strokeWidth={2} fill="url(#gradFat)" />
                <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#4CAF50" strokeWidth={2} fill="url(#gradLuc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ── RATINGS TAB ── */}
      {activeTab === "ratings" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3"><Star size={18} color="#F4A261" /><span style={{ color: "#9da89a", fontSize: "12px" }}>Nota Média Geral</span></div>
              <p style={{ color: "#f5f1e8", fontSize: "28px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{avgRating.toFixed(1)}</p>
              <div className="flex gap-0.5 mt-2">{[1,2,3,4,5].map((s) => <Star key={s} size={14} fill={s <= Math.round(avgRating) ? "#F4A261" : "transparent"} color={s <= Math.round(avgRating) ? "#F4A261" : "#3a4e35"} />)}</div>
            </div>
            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3"><Star size={18} color="#4CAF50" /><span style={{ color: "#9da89a", fontSize: "12px" }}>Avaliações 5★</span></div>
              <p style={{ color: "#4CAF50", fontSize: "28px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{reviews.filter((r) => r.stars === 5).length}</p>
              <p style={{ color: "#9da89a", fontSize: "12px", marginTop: "4px" }}>{reviews.length > 0 ? `${((reviews.filter((r) => r.stars === 5).length / reviews.length) * 100).toFixed(0)}% do total` : "0%"}</p>
            </div>
            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3"><AlertTriangle size={18} color="#D64545" /><span style={{ color: "#9da89a", fontSize: "12px" }}>Avaliações Baixas (≤3)</span></div>
              <p style={{ color: "#D64545", fontSize: "28px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{reviews.filter((r) => r.stars <= 3).length}</p>
              <p style={{ color: "#9da89a", fontSize: "12px", marginTop: "4px" }}>Requerem atenção</p>
            </div>
            <div className="rounded-2xl p-5" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3"><TrendingUp size={18} color="#75B044" /><span style={{ color: "#9da89a", fontSize: "12px" }}>Total de Avaliações</span></div>
              <p style={{ color: "#75B044", fontSize: "28px", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{reviews.length}</p>
              <p style={{ color: "#9da89a", fontSize: "12px", marginTop: "4px" }}>Pedidos avaliados</p>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={cardStyle}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f5f1e8", marginBottom: "16px" }}>Distribuição de Estrelas</h3>
            <div className="space-y-3">
              {[5,4,3,2,1].map((star) => {
                const count = reviews.filter((r) => r.stars === star).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                const color = star >= 4 ? "#4CAF50" : star === 3 ? "#F4A261" : "#D64545";
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 flex-shrink-0">
                      <Star size={14} fill={color} color={color} />
                      <span style={{ color: "#9da89a", fontSize: "13px" }}>{star}</span>
                    </div>
                    <div className="flex-1 h-2.5 rounded-full" style={{ background: "#3a4e35" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                        className="h-full rounded-full" style={{ background: color }} />
                    </div>
                    <span style={{ color: "#9da89a", fontSize: "12px", width: "40px", textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #3a4e35" }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, color: "#f5f1e8" }}>Comentários Recentes</h3>
            </div>
            <div className="divide-y" style={{ borderColor: "#3a4e35" }}>
              {reviews.length > 0 ? reviews.map((review) => {
                const color = review.stars >= 4 ? "#4CAF50" : review.stars === 3 ? "#F4A261" : "#D64545";
                return (
                  <div key={review.id} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#3a4e35", color: "#d4745f" }}>
                          {review.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p style={{ color: "#f5f1e8", fontSize: "13px", fontWeight: 500 }}>{review.customerName}</p>
                          <p style={{ color: "#9da89a", fontSize: "11px" }}>{review.orderId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <Star key={s} size={12} fill={s <= review.stars ? "#F4A261" : "transparent"} color={s <= review.stars ? "#F4A261" : "#3a4e35"} />)}</div>
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: color + "18", color, fontSize: "11px" }}>{review.stars}★</span>
                      </div>
                    </div>
                    {review.comment && <p style={{ color: "#9da89a", fontSize: "13px", lineHeight: 1.5, paddingLeft: "44px" }}>{review.comment}</p>}
                  </div>
                );
              }) : (
                <div className="py-10 text-center">
                  <Star size={28} color="#3a4e35" className="mx-auto mb-2" />
                  <p style={{ color: "#9da89a", fontSize: "13px" }}>Nenhuma avaliação ainda</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
