import React, { useState } from "react";
import { motion } from "motion/react";
import { Clock, Phone, MapPin, Instagram, Globe, Save, ToggleLeft, ToggleRight, Calendar, DollarSign, ChevronDown } from "lucide-react";
import { useApp } from "../../store/AppContext";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

interface Schedule {
  open: boolean;
  from: string;
  to: string;
}

export default function SettingsPage() {
  const { restaurantOpen, toggleRestaurant, pricePeriodDays, setPricePeriodDays } = useApp();
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "DaHorta",
    tagline: "Bowls orgânicos, sabor natural.",
    phone: "(11) 99999-0001",
    whatsapp: "(11) 99999-0001",
    email: "contato@dahorta.com",
    address: "Rua dos Orgânicos, 42",
    city: "São Paulo, SP",
    deliveryFee: "6.00",
    deliveryTime: "35-50",
    minOrder: "20.00",
    instagram: "@dahorta",
    website: "dahorta.com",
  });

  const [schedule, setSchedule] = useState<Record<string, Schedule>>({
    Segunda: { open: true, from: "11:00", to: "23:00" },
    Terça: { open: true, from: "11:00", to: "23:00" },
    Quarta: { open: true, from: "11:00", to: "23:00" },
    Quinta: { open: true, from: "11:00", to: "23:00" },
    Sexta: { open: true, from: "11:00", to: "00:00" },
    Sábado: { open: true, from: "11:00", to: "00:00" },
    Domingo: { open: true, from: "11:00", to: "22:00" },
  });

  const [saved, setSaved] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(pricePeriodDays);

  const handleSave = async () => {
    setPricePeriodDays(selectedPeriod);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fieldStyle = {
    background: "#253625", border: "1px solid #3a4e35",
    color: "#f5f1e8", fontSize: "14px", borderRadius: "10px",
  };

  const Section = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) => (
    <div className="rounded-2xl p-6" style={{ background: "#2d4a2d", border: "1px solid #3a4e35", marginBottom: "20px" }}>
      <div className="flex items-center gap-2 mb-5">
        {icon && <div style={{ color: "#d4745f" }}>{icon}</div>}
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: 600, color: "#f5f5f5" }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-3xl" style={{ color: "#f0ece6" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="overline-label mb-2">Sistema</p>
          <h1 className="display-heading" style={{ fontSize: 26, color: "#000000" }}>Configurações</h1>
          <p style={{ color: "#ffffff", fontSize: "13px", marginTop: "2px" }}>Informações e preferências do restaurante</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
          style={{ background: saved ? "#4CAF50" : "#d4745f", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
          <Save size={16} />{saved ? "Salvo!" : "Salvar"}
        </button>
      </div>

      {/* Status */}
      <Section title="Status do Restaurante">
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#1c1c1c" }}>
          <div>
            <p style={{ color: "#f5f5f5", fontSize: "14px", fontWeight: 500 }}>Restaurante {restaurantOpen ? "Aberto" : "Fechado"}</p>
            <p style={{ color: "#ffffff", fontSize: "12px", marginTop: "2px" }}>Controle a disponibilidade do seu restaurante</p>
          </div>
          <button onClick={toggleRestaurant} style={{ color: restaurantOpen ? "#22c55e" : "#ffffff", background: "none", border: "none", cursor: "pointer" }}>
            {restaurantOpen ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
          </button>
        </div>
      </Section>

      {/* Precificação */}
      <Section title="Inteligência de Precificação" icon={<DollarSign size={18} />}>
        <div className="space-y-4">
          <div>
            <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "8px" }}>
              Período de Validade de Preços
            </label>
            <p style={{ color: "#ffffff", fontSize: "12px", marginBottom: "12px" }}>
              Define por quantos dias um registro de preço é considerado válido para cálculo da ficha técnica. Registros mais antigos que este período serão ignorados para precificação.
            </p>
            <div className="flex gap-3 flex-wrap">
              {[30, 60, 90, 120].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedPeriod(days)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                  style={{
                    background: selectedPeriod === days ? "rgba(212,116,95,0.12)" : "#253625",
                    border: `1px solid ${selectedPeriod === days ? "rgba(212,116,95,0.4)" : "#3a4e35"}`,
                    color: selectedPeriod === days ? "#d4745f" : "#ffffff",
                    cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  }}
                >
                  <Calendar size={14} />
                  {days} dias
                </button>
              ))}
              <div className="relative">
                <input
                  type="number" min="7" max="365" value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(parseInt(e.target.value) || 60)}
                  className="pl-3 pr-10 py-2.5 rounded-xl outline-none"
                  style={{ ...fieldStyle, width: "100px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#d4745f")}
                  onBlur={(e) => (e.target.style.borderColor = "#3a4e35")}
                />
                <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#ffffff", fontSize: "12px", pointerEvents: "none" }}>d</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(212,116,95,0.06)", border: "1px solid rgba(212,116,95,0.18)" }}>
              <p style={{ color: "#d4745f", fontSize: "12px", fontWeight: 600 }}>✓ Configuração atual: {selectedPeriod} dias</p>
              <p style={{ color: "#ffffff", fontSize: "11px", marginTop: "2px" }}>
                Registros de preços anteriores a {new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} serão desconsiderados.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Informações Básicas */}
      <Section title="Informações do Restaurante">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Nome</label>
              <input value={restaurantInfo.name} onChange={(e) => setRestaurantInfo((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
            </div>
            <div>
              <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Slogan</label>
              <input value={restaurantInfo.tagline} onChange={(e) => setRestaurantInfo((p) => ({ ...p, tagline: e.target.value }))} className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Telefone</label>
              <div className="relative">
                <input value={restaurantInfo.phone} onChange={(e) => setRestaurantInfo((p) => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 outline-none pl-10" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
                <Phone size={14} color="#ffffff" className="absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>E-mail</label>
              <input type="email" value={restaurantInfo.email} onChange={(e) => setRestaurantInfo((p) => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
            </div>
          </div>
          <div>
            <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Endereço</label>
            <div className="relative">
              <input value={restaurantInfo.address} onChange={(e) => setRestaurantInfo((p) => ({ ...p, address: e.target.value }))} className="w-full px-4 py-2.5 outline-none pl-10" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
              <MapPin size={14} color="#ffffff" className="absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Instagram</label>
              <div className="relative">
                <input value={restaurantInfo.instagram} onChange={(e) => setRestaurantInfo((p) => ({ ...p, instagram: e.target.value }))} className="w-full px-4 py-2.5 outline-none pl-10" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
                <Instagram size={14} color="#ffffff" className="absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Website</label>
              <div className="relative">
                <input value={restaurantInfo.website} onChange={(e) => setRestaurantInfo((p) => ({ ...p, website: e.target.value }))} className="w-full px-4 py-2.5 outline-none pl-10" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
                <Globe size={14} color="#ffffff" className="absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Entrega */}
      <Section title="Configurações de Entrega">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Taxa de Entrega (R$)</label>
            <input type="number" step="0.01" value={restaurantInfo.deliveryFee} onChange={(e) => setRestaurantInfo((p) => ({ ...p, deliveryFee: e.target.value }))} className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
          </div>
          <div>
            <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Tempo Estimado (min)</label>
            <input value={restaurantInfo.deliveryTime} onChange={(e) => setRestaurantInfo((p) => ({ ...p, deliveryTime: e.target.value }))} placeholder="35-50" className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
          </div>
          <div>
            <label style={{ color: "#ffffff", fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Pedido Mínimo (R$)</label>
            <input type="number" step="0.01" value={restaurantInfo.minOrder} onChange={(e) => setRestaurantInfo((p) => ({ ...p, minOrder: e.target.value }))} className="w-full px-4 py-2.5 outline-none" style={fieldStyle} onFocus={(e) => (e.target.style.borderColor = "#f97316")} onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")} />
          </div>
        </div>
      </Section>

      {/* Horários */}
      <Section title="Horário de Funcionamento" icon={<Clock size={18} />}>
        <div className="space-y-3">
          {DAYS.map((day) => {
            const s = schedule[day];
            return (
              <div key={day} className="flex items-center gap-4">
                <button onClick={() => setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], open: !prev[day].open } }))}
                  style={{ color: s.open ? "#22c55e" : "#ffffff", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                  {s.open ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                <span style={{ color: s.open ? "#ffffff" : "#ffffff", fontSize: "13px", width: "70px", flexShrink: 0 }}>{day}</span>
                {s.open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={s.from} onChange={(e) => setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], from: e.target.value } }))}
                      className="px-3 py-1.5 rounded-lg outline-none text-sm" style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", color: "#f5f5f5" }} />
                    <span style={{ color: "#ffffff", fontSize: "12px" }}>até</span>
                    <input type="time" value={s.to} onChange={(e) => setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], to: e.target.value } }))}
                      className="px-3 py-1.5 rounded-lg outline-none text-sm" style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", color: "#f5f5f5" }} />
                  </div>
                ) : (
                  <span style={{ color: "#ffffff", fontSize: "12px" }}>Fechado</span>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}