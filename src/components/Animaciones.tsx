import type { AnimId } from "@/lib/escena";

// Caja del objeto en % del escenario; las animaciones se colocan relativas a ella.
export type Caja = { l: number; t: number; w: number; h: number };
export type Anim = { id: string; tipo: AnimId; caja: Caja; variante: number };

export const DURACION: Record<AnimId, number> = { zzz: 2600, cuadro: 2600, murcielago: 2400, pez: 2000 };

function Fantasma() {
  return (
    <svg viewBox="0 0 60 70" className="svg-lleno">
      <path d="M30 4C14 4 6 17 6 32v32l8-6 8 6 8-6 8 6 8-6 8 6V32C54 17 46 4 30 4z" fill="oklch(0.99 0 0)" stroke="oklch(0.8 0.03 300)" strokeWidth="2" />
      <ellipse cx="22" cy="30" rx="3.5" ry="5" fill="oklch(0.25 0.03 300)" />
      <ellipse cx="38" cy="30" rx="3.5" ry="5" fill="oklch(0.25 0.03 300)" />
      <ellipse cx="30" cy="42" rx="4" ry="3" fill="oklch(0.25 0.03 300)" />
      <circle cx="16" cy="38" r="3" fill="oklch(0.85 0.08 0)" /><circle cx="44" cy="38" r="3" fill="oklch(0.85 0.08 0)" />
    </svg>
  );
}
function Exclamacion() {
  return (
    <svg viewBox="0 0 30 70" className="svg-lleno">
      <rect x="8" y="2" width="14" height="44" rx="7" fill="oklch(0.6 0.23 27)" stroke="oklch(0.99 0 0)" strokeWidth="3" />
      <circle cx="15" cy="60" r="8" fill="oklch(0.6 0.23 27)" stroke="oklch(0.99 0 0)" strokeWidth="3" />
    </svg>
  );
}
function Murcielago() {
  return (
    <svg viewBox="0 0 80 40" className="svg-lleno">
      <g className="ala ala-izq"><path d="M36 20C28 6 14 4 2 10c6 2 8 8 6 12 4-3 9-2 11 2 3-4 9-4 13 0z" fill="oklch(0.18 0.02 300)" /></g>
      <g className="ala ala-der"><path d="M44 20C52 6 66 4 78 10c-6 2-8 8-6 12-4-3-9-2-11 2-3-4-9-4-13 0z" fill="oklch(0.18 0.02 300)" /></g>
      <ellipse cx="40" cy="22" rx="8" ry="10" fill="oklch(0.18 0.02 300)" />
      <path d="M34 14l2-7 3 6M46 14l-2-7-3 6" fill="oklch(0.18 0.02 300)" />
      <circle cx="37" cy="20" r="2.2" fill="oklch(1 0 0)" /><circle cx="43" cy="20" r="2.2" fill="oklch(1 0 0)" />
    </svg>
  );
}
function Pez() {
  return (
    <svg viewBox="0 0 50 30" className="svg-lleno">
      <path d="M38 15l11-9v18z" fill="oklch(0.7 0.17 50)" />
      <ellipse cx="22" cy="15" rx="18" ry="11" fill="oklch(0.75 0.17 55)" />
      <path d="M18 5c3 4 3 16 0 20" stroke="oklch(0.88 0.1 70)" strokeWidth="2" fill="none" />
      <circle cx="10" cy="12" r="2.5" fill="oklch(0.2 0 0)" /><circle cx="9.4" cy="11.3" r="0.8" fill="oklch(1 0 0)" />
    </svg>
  );
}

export function CapaAnimacion({ a }: { a: Anim }) {
  const { l, t, w, h } = a.caja;
  const en = (fx: number, fy: number, ancho: number) => ({ left: `${l + w * fx}%`, top: `${t + h * fy}%`, width: `${ancho}%` });

  if (a.tipo === "zzz") {
    return (
      <div className="anim" style={en(0.58, 0.12, 6)}>
        {[0, 1, 2].map((i) => <span key={i} className="zzz" style={{ animationDelay: `${i * 450}ms`, fontSize: `${0.9 + i * 0.25}em`, left: `${i * 30}%` }}>Z</span>)}
      </div>
    );
  }
  if (a.tipo === "cuadro") {
    return a.variante < 0.5
      ? <div className="anim fantasma" style={en(0.35, 0.25, 6)}><Fantasma /></div>
      : <div className="anim exclama" style={en(0.45, -0.15, 2.5)}><Exclamacion /></div>;
  }
  if (a.tipo === "murcielago") {
    return <div className={`anim murcielago ${a.variante < 0.5 ? "" : "espejo"}`} style={en(0.4, 0.55, 6)}><Murcielago /></div>;
  }
  // pez: salta desde la superficie del agua
  return (
    <div className="anim pecera-anim" style={{ ...en(0.15, 0.28, w * 0.7) }}>
      <div className="pez"><Pez /></div>
      <span className="gota g1" /><span className="gota g2" /><span className="gota g3" />
      <span className="onda o1" /><span className="onda o2" />
    </div>
  );
}
