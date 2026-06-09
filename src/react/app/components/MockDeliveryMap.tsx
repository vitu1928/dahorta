import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { MapPin, Navigation, Home, Bike } from "lucide-react";

interface MockDeliveryMapProps {
  motoboyName?: string;
  customerAddress?: string;
}

// Simulated street grid positions
const RESTAURANT_POS = { x: 15, y: 75 };
const CUSTOMER_POS = { x: 78, y: 22 };

// Path waypoints (simulating real street routing)
const PATH_WAYPOINTS = [
  { x: 15, y: 75 },
  { x: 15, y: 60 },
  { x: 30, y: 60 },
  { x: 30, y: 45 },
  { x: 50, y: 45 },
  { x: 50, y: 30 },
  { x: 65, y: 30 },
  { x: 65, y: 22 },
  { x: 78, y: 22 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getPositionAlongPath(progress: number) {
  if (progress <= 0) return PATH_WAYPOINTS[0];
  if (progress >= 1) return PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1];

  const totalSegments = PATH_WAYPOINTS.length - 1;
  const segmentProgress = progress * totalSegments;
  const segmentIndex = Math.floor(segmentProgress);
  const segmentT = segmentProgress - segmentIndex;

  const from = PATH_WAYPOINTS[Math.min(segmentIndex, totalSegments - 1)];
  const to = PATH_WAYPOINTS[Math.min(segmentIndex + 1, totalSegments)];

  return {
    x: lerp(from.x, to.x, segmentT),
    y: lerp(from.y, to.y, segmentT),
  };
}

export function MockDeliveryMap({ motoboyName = "Diego", customerAddress }: MockDeliveryMapProps) {
  const [progress, setProgress] = useState(0.15);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Simulate motoboy moving slowly toward destination
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.003;
        return next >= 0.95 ? 0.95 : next; // Stop near destination
      });
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const motoboyPos = getPositionAlongPath(progress);
  const eta = Math.max(1, Math.round((1 - progress) * 18));

  // Street grid lines
  const streets = [
    // Horizontal
    { x1: 0, y1: 22, x2: 100, y2: 22 },
    { x1: 0, y1: 45, x2: 100, y2: 45 },
    { x1: 0, y1: 60, x2: 100, y2: 60 },
    { x1: 0, y1: 75, x2: 100, y2: 75 },
    // Vertical
    { x1: 15, y1: 0, x2: 15, y2: 100 },
    { x1: 30, y1: 0, x2: 30, y2: 100 },
    { x1: 50, y1: 0, x2: 50, y2: 100 },
    { x1: 65, y1: 0, x2: 65, y2: 100 },
    { x1: 78, y1: 0, x2: 78, y2: 100 },
  ];

  const pathD = PATH_WAYPOINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
      {/* Map Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
          <span style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 600 }}>Rastreamento ao Vivo</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(212,116,95,0.1)", border: "1px solid rgba(212,116,95,0.2)" }}>
          <Bike size={13} color="var(--primary)" />
          <span style={{ color: "var(--primary)", fontSize: "12px", fontWeight: 600 }}>~{eta} min</span>
        </div>
      </div>

      {/* SVG Map */}
      <div style={{ position: "relative", background: "var(--muted)" }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "240px", display: "block" }}>
          {/* Background blocks (city blocks) */}
          {[
            { x: 0, y: 0, w: 15, h: 22 }, { x: 15, y: 0, w: 15, h: 22 }, { x: 30, y: 0, w: 20, h: 22 },
            { x: 50, y: 0, w: 15, h: 22 }, { x: 65, y: 0, w: 13, h: 22 }, { x: 78, y: 0, w: 22, h: 22 },
            { x: 0, y: 22, w: 15, h: 23 }, { x: 15, y: 22, w: 15, h: 23 }, { x: 30, y: 22, w: 20, h: 23 },
            { x: 50, y: 22, w: 15, h: 23 }, { x: 65, y: 22, w: 13, h: 23 }, { x: 78, y: 22, w: 22, h: 23 },
            { x: 0, y: 45, w: 15, h: 15 }, { x: 15, y: 45, w: 15, h: 15 }, { x: 30, y: 45, w: 20, h: 15 },
            { x: 50, y: 45, w: 15, h: 15 }, { x: 65, y: 45, w: 13, h: 15 }, { x: 78, y: 45, w: 22, h: 15 },
            { x: 0, y: 60, w: 15, h: 15 }, { x: 15, y: 60, w: 15, h: 15 }, { x: 30, y: 60, w: 20, h: 15 },
            { x: 50, y: 60, w: 15, h: 15 }, { x: 65, y: 60, w: 13, h: 15 }, { x: 78, y: 60, w: 22, h: 15 },
            { x: 0, y: 75, w: 15, h: 25 }, { x: 15, y: 75, w: 15, h: 25 }, { x: 30, y: 75, w: 20, h: 25 },
            { x: 50, y: 75, w: 15, h: 25 }, { x: 65, y: 75, w: 13, h: 25 }, { x: 78, y: 75, w: 22, h: 25 },
          ].map((b, i) => (
            <rect key={i} x={b.x + 0.5} y={b.y + 0.5} width={b.w - 1} height={b.h - 1} fill="#253625" rx="0.5" />
          ))}

          {/* Street lines */}
          {streets.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#3a4e35" strokeWidth="1.2" />
          ))}

          {/* Delivery path — dashed */}
          <path d={pathD} fill="none" stroke="rgba(212,116,95,0.3)" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Completed path — solid primary */}
          <path
            d={PATH_WAYPOINTS.slice(0, Math.floor(progress * (PATH_WAYPOINTS.length - 1)) + 2).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
            fill="none" stroke="#d4745f" strokeWidth="1.5" strokeLinecap="round"
          />

          {/* Restaurant marker */}
          <g transform={`translate(${RESTAURANT_POS.x}, ${RESTAURANT_POS.y})`}>
            <circle cx="0" cy="0" r="3.5" fill="#d4745f" />
            <circle cx="0" cy="0" r="5.5" fill="rgba(212,116,95,0.2)" />
            <text x="0" y="0.7" textAnchor="middle" style={{ fontSize: "3px", fill: "white", fontWeight: "bold" }}>🥗</text>
          </g>
          <text x={RESTAURANT_POS.x} y={RESTAURANT_POS.y + 9} textAnchor="middle" style={{ fontSize: "2.8px", fill: "#d4745f", fontWeight: "600" }}>DaHorta</text>

          {/* Customer marker */}
          <g transform={`translate(${CUSTOMER_POS.x}, ${CUSTOMER_POS.y})`}>
            <circle cx="0" cy="0" r="3.5" fill="#22c55e" />
            <circle cx="0" cy="0" r="5.5" fill="rgba(34,197,94,0.2)" />
            <text x="0" y="0.7" textAnchor="middle" style={{ fontSize: "3px", fill: "white" }}>🏠</text>
          </g>
          <text x={CUSTOMER_POS.x} y={CUSTOMER_POS.y - 8} textAnchor="middle" style={{ fontSize: "2.5px", fill: "#22c55e" }}>Destino</text>

          {/* Motoboy marker (animated) */}
          <g transform={`translate(${motoboyPos.x}, ${motoboyPos.y})`}>
            {/* Pulse ring */}
            <circle cx="0" cy="0" r="6" fill="rgba(212,116,95,0.08)">
              <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="3.8" fill="#d4745f" />
            <circle cx="0" cy="0" r="2.2" fill="white" />
            <text x="0" y="0.8" textAnchor="middle" style={{ fontSize: "2.5px" }}>🛵</text>
          </g>
          <text x={motoboyPos.x} y={motoboyPos.y - 6} textAnchor="middle" style={{ fontSize: "2.5px", fill: "#d4745f", fontWeight: "600" }}>{motoboyName}</text>
        </svg>

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.5)", fontSize: "9px", color: "var(--muted-foreground)" }}>
          Rastreamento simulado
        </div>
      </div>

      {/* Bottom info */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(212,116,95,0.12)" }}>
            <Bike size={12} color="var(--primary)" />
          </div>
          <div>
            <p style={{ color: "var(--foreground)", fontSize: "12px", fontWeight: 600 }}>{motoboyName}</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Motoboy</p>
          </div>
        </div>
        {customerAddress && (
          <div className="text-right max-w-[60%]">
            <p style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>Entregando em</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customerAddress}</p>
          </div>
        )}
      </div>
    </div>
  );
}