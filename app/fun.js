"use client";
// Ilustraciones y animaciones de Everest Training (SVG en línea + CSS).
import { useEffect, useRef, useState } from "react";

const BODY = "M34.17,17.03c2.14-8.8-11.7-11.71-14.78-3.25L13.92,28.81c-3.42,9.4,13.83,14.62,16.31,4.88";

/** Mosquetón. open = gatillo abierto. anim = "snap" | "swing" | null */
export function Carabiner({ open = false, color, anim = null, size = 20, className = "" }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={`ico carabiner ${anim ? "anim-" + anim : ""} ${className}`} aria-hidden="true">
      <path d={BODY} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path className={`gate ${open ? "open" : ""}`} d="M34.17,17.03L30.23,33.69" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function XMark({ anim = false, size = 20 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={`ico xmark ${anim ? "anim-shake" : ""}`} aria-hidden="true">
      <path d="M13,13L35,35M35,13L13,35" fill="none" stroke="#c0392b" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}

export const YesIcon = (p) => <Carabiner color="#2f7d4a" {...p} />;
export const MaybeIcon = (p) => <Carabiner color="#b07a00" open {...p} />;

/** 2. Logo: escalador que trepa por una pared al cargar */
export function ClimberLogo() {
  return (
    <svg viewBox="0 0 40 48" width="34" height="41" className="logo" aria-hidden="true">
      <rect x="4" y="2" width="32" height="44" rx="6" fill="var(--wall)" />
      <circle cx="12" cy="12" r="2.6" fill="#e0703a" />
      <circle cx="28" cy="18" r="2.4" fill="#2f7d4a" />
      <circle cx="14" cy="28" r="2.6" fill="#3b6fb6" />
      <circle cx="27" cy="36" r="2.4" fill="#b07a00" />
      <circle cx="18" cy="41" r="2" fill="#c0392b" />
      <g className="climber">
        <circle cx="20" cy="13" r="3.2" fill="var(--ink)" />
        <path d="M20 16.5 L20 26" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
        <path className="arm-l" d="M20 18 L14 12" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
        <path className="arm-r" d="M20 18 L26 14" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
        <path className="leg-l" d="M20 26 L15 31" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
        <path className="leg-r" d="M20 26 L25 32" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** 3. Pared con cuerda que sube según cuánta gente va; bandera al llegar al grupo */
export const GROUP_SIZE = 4;
export function RopeWall({ count }) {
  const pct = Math.min(count / GROUP_SIZE, 1);
  const top = 8, bottom = 70;
  const y = bottom - (bottom - top) * pct;
  const done = count >= GROUP_SIZE;
  return (
    <div className="ropewall" title={done ? "¡Hay grupo!" : `Faltan ${GROUP_SIZE - count} para hacer grupo`}>
      <svg viewBox="0 0 36 78" width="34" height="74" aria-hidden="true">
        <rect x="6" y="6" width="24" height="68" rx="5" fill="var(--wall)" />
        <circle cx="12" cy="62" r="2" fill="#3b6fb6" />
        <circle cx="24" cy="48" r="2" fill="#e0703a" />
        <circle cx="12" cy="33" r="2" fill="#2f7d4a" />
        <circle cx="24" cy="19" r="2" fill="#b07a00" />
        <line x1="18" y1={bottom} x2="18" y2={top} stroke="var(--line)" strokeWidth="2" strokeDasharray="2 3" />
        <line className="rope" x1="18" y1={bottom} x2="18" y2={y} stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        <circle className="rope-tip" cx="18" cy={y} r="3.2" fill="var(--accent)" />
        <g className={`flag ${done ? "up" : ""}`}>
          <line x1="18" y1="8" x2="18" y2="-6" stroke="var(--ink)" strokeWidth="1.6" />
          <path d="M18 -6 L30 -2 L18 2 Z" fill="#c0392b" />
        </g>
      </svg>
      <span>{done ? "¡Grupo!" : `${Math.min(count, GROUP_SIZE)}/${GROUP_SIZE}`}</span>
    </div>
  );
}

/** 4. Confeti de presas y tiza */
const HOLD_COLORS = ["#e0703a", "#2f7d4a", "#3b6fb6", "#b07a00", "#c0392b", "#8e5bb5"];
export function Confetti({ burst }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!burst) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const list = Array.from({ length: 46 }, (_, i) => ({
      id: `${burst}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 1.6 + Math.random() * 1.2,
      rot: Math.random() * 720 - 360,
      drift: Math.random() * 120 - 60,
      size: 8 + Math.random() * 10,
      chalk: i % 4 === 0,
      color: HOLD_COLORS[i % HOLD_COLORS.length],
      shape: i % 3,
    }));
    setPieces(list);
    const t = setTimeout(() => setPieces([]), 3400);
    return () => clearTimeout(t);
  }, [burst]);
  if (!pieces.length) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span key={p.id} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, "--rot": `${p.rot}deg`, "--drift": `${p.drift}px` }}>
          {p.chalk ? (
            <svg width={p.size} height={p.size} viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#fff" opacity="0.85" /></svg>
          ) : (
            <svg width={p.size * 1.4} height={p.size * 1.4} viewBox="0 0 20 20">
              <path d={["M3 12 C2 5 10 1 15 4 C19 7 18 15 12 17 C7 19 4 16 3 12 Z", "M2 14 L8 3 L18 8 L14 17 Z", "M10 2 C16 2 18 8 16 13 C14 18 6 18 4 13 C2 8 5 2 10 2 Z"][p.shape]} fill={p.color} />
              <circle cx="10" cy="10" r="2" fill="rgba(0,0,0,.35)" />
            </svg>
          )}
        </span>
      ))}
      <div className="confetti-msg">¡Ya sois {GROUP_SIZE}! 🎉</div>
    </div>
  );
}

/** 5. Solecito que late junto a "Hoy" */
export function TodaySun() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className="sun" aria-hidden="true">
      <g className="rays" stroke="#e0a43a" strokeWidth="2" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="12" y1="2" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
        ))}
      </g>
      <circle className="core" cx="12" cy="12" r="5" fill="#f2b43c" />
    </svg>
  );
}

/** 6. Día vacío: escalador colgado bostezando */
export function SleepyClimber() {
  return (
    <div className="sleepy">
      <svg viewBox="0 0 60 64" width="46" height="49" aria-hidden="true">
        <line x1="30" y1="0" x2="30" y2="14" stroke="var(--accent)" strokeWidth="2" />
        <g className="hang">
          <line x1="30" y1="0" x2="30" y2="16" stroke="var(--accent)" strokeWidth="2" />
          <path d="M24 16 Q30 22 36 16" fill="none" stroke="var(--muted)" strokeWidth="2" />
          <circle cx="30" cy="27" r="6" fill="var(--card)" stroke="var(--ink)" strokeWidth="2" />
          <path d="M27 26 L29 26 M31 26 L33 26" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse className="yawn" cx="30" cy="30" rx="1.6" ry="1.2" fill="var(--ink)" />
          <path d="M30 33 L30 47 M30 37 L23 43 M30 37 L37 43 M30 47 L25 58 M30 47 L35 58" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
        <text className="zz z1" x="42" y="22" fontSize="8" fill="var(--muted)">z</text>
        <text className="zz z2" x="47" y="14" fontSize="10" fill="var(--muted)">z</text>
      </svg>
      <span>¿Nadie trepa hoy?</span>
    </div>
  );
}

/** 7. Cresta de montaña que se dibuja al entrar en pantalla */
export function Ridge() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <svg ref={ref} className={`ridge ${seen ? "drawn" : ""}`} viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M0 22 L28 16 L44 19 L70 6 L84 12 L98 9 L122 20 L150 14 L166 17 L190 2 L204 10 L216 7 L240 18 L262 13 L280 19 L300 15" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path className="snow" d="M182 6 L190 2 L197 6 L193 5 L190 7 L186 5 Z" fill="var(--accent)" />
    </svg>
  );
}

/** 8. Mosquetón girando mientras carga */
export function Loader({ text = "Cargando…" }) {
  return (
    <div className="loader" role="status">
      <Carabiner color="var(--accent)" size={30} className="spin" />
      <span>{text}</span>
    </div>
  );
}
