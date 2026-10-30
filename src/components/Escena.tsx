import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ACCIONES, FONDO, MENU_ITEMS, OBJETOS, UMBRAL_TOQUE, ZOOM_MAX, ZOOM_MIN, type PanelId } from "@/lib/escena";
import { Panel } from "@/components/Panel";
import { CapaAnimacion, DURACION, type Anim } from "@/components/Animaciones";
import { Gatos } from "@/components/paneles/Gatos";
import { Agenda } from "@/components/paneles/Agenda";
import { Musica } from "@/components/paneles/Musica";
import { Libros } from "@/components/paneles/Libros";

type Vista = { s: number; x: number; y: number };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PANELES: Record<PanelId, { titulo: string; Contenido: () => React.JSX.Element }> = {
  cel: { titulo: "Cat memes", Contenido: Gatos },
  computadora: { titulo: "Calendar", Contenido: Agenda },
  grabadora: { titulo: "Music", Contenido: Musica },
  librero: { titulo: "Books", Contenido: Libros },
};

export function Escena() {
  const visorRef = useRef<HTMLDivElement>(null);
  const escenaRef = useRef<HTMLDivElement>(null);
  const [vista, setVista] = useState<Vista>({ s: 1, x: 0, y: 0 });
  const vistaRef = useRef(vista);
  vistaRef.current = vista;

  const [oscuro, setOscuro] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [guia, setGuia] = useState(false);
  const [aviso, setAviso] = useState(false);
  const [panel, setPanel] = useState<PanelId | null>(null);
  const panelRef = useRef(panel);
  panelRef.current = panel;
  const [anims, setAnims] = useState<Anim[]>([]);
  const animando = useRef(new Set<string>());
  const [tocado, setTocado] = useState<string | null>(null);

  // Modo oscuro: preferencia guardada o la del dispositivo
  useEffect(() => {
    let guardado: string | null = null;
    try { guardado = localStorage.getItem("tema"); } catch { /* sin almacenamiento */ }
    setOscuro(guardado ? guardado === "oscuro" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    setGuia(new URLSearchParams(window.location.search).get("guia") === "1");
    const vertical = window.matchMedia("(orientation: portrait) and (max-width: 600px)");
    let descartado = false;
    try { descartado = sessionStorage.getItem("avisoGiro") === "1"; } catch { /* nada */ }
    if (!descartado) setAviso(vertical.matches);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", oscuro); }, [oscuro]);
  const cambiarTema = () => {
    const nuevo = !oscuro;
    setOscuro(nuevo);
    try { localStorage.setItem("tema", nuevo ? "oscuro" : "claro"); } catch { /* nada */ }
  };

  // Limita el desplazamiento para no ver fuera del escenario
  const limitar = useCallback((v: Vista): Vista => {
    const el = escenaRef.current;
    if (!el) return v;
    const s = clamp(v.s, ZOOM_MIN, ZOOM_MAX);
    const mx = ((s - 1) * el.offsetWidth) / 2;
    const my = ((s - 1) * el.offsetHeight) / 2;
    return { s, x: clamp(v.x, -mx, mx), y: clamp(v.y, -my, my) };
  }, []);

  // Zoom anclado a un punto de pantalla (clientX/Y)
  const zoomEn = useCallback((nueva: number, cx?: number, cy?: number) => {
    const el = escenaRef.current;
    if (!el) return;
    const v = vistaRef.current;
    const s = clamp(nueva, ZOOM_MIN, ZOOM_MAX);
    const r = el.getBoundingClientRect();
    const centroX = r.left + r.width / 2 - v.x;
    const centroY = r.top + r.height / 2 - v.y;
    const px = (cx ?? centroX) - centroX;
    const py = (cy ?? centroY) - centroY;
    const k = s / v.s;
    setVista(limitar({ s, x: px - (px - v.x) * k, y: py - (py - v.y) * k }));
  }, [limitar]);

  const restablecer = () => setVista({ s: 1, x: 0, y: 0 });

  // Toque/teclado sobre un objeto
  const activar = useCallback((id: string) => {
    const acc = ACCIONES[id];
    setTocado(id);
    window.setTimeout(() => setTocado((t) => (t === id ? null : t)), 320);
    if (!acc) return;
    if ("panel" in acc) { setPanel(acc.panel); setMenuAbierto(false); return; }
    if (animando.current.has(id)) return;
    const esc = escenaRef.current;
    const btn = esc?.querySelector<HTMLElement>(`.objeto[data-id="${id}"]`);
    if (!esc || !btn) return;
    const W = esc.offsetWidth, H = esc.offsetHeight;
    const caja = { l: (btn.offsetLeft / W) * 100, t: (btn.offsetTop / H) * 100, w: (btn.offsetWidth / W) * 100, h: (btn.offsetHeight / H) * 100 };
    animando.current.add(id);
    setAnims((as) => [...as, { id, tipo: acc.anim, caja, variante: Math.random() }]);
    window.setTimeout(() => {
      animando.current.delete(id);
      setAnims((as) => as.filter((a) => a.id !== id));
    }, DURACION[acc.anim]);
  }, []);

  // Rueda / pellizco de trackpad + bloqueo de gestos nativos de iOS
  useEffect(() => {
    const el = visorRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (panelRef.current) return;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const f = e.ctrlKey ? 0.01 : 0.0015;
      zoomEn(vistaRef.current.s * Math.exp(-dy * f), e.clientX, e.clientY);
    };
    const noGesto = (e: Event) => e.preventDefault();
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", noGesto);
    el.addEventListener("gesturechange", noGesto);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("gesturestart", noGesto);
      el.removeEventListener("gesturechange", noGesto);
    };
  }, [zoomEn]);

  // Teclado: +, −, 0 (no con texto enfocado ni panel abierto)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (panelRef.current || t?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "+" || e.key === "=") zoomEn(vistaRef.current.s * 1.25);
      else if (e.key === "-" || e.key === "_") zoomEn(vistaRef.current.s / 1.25);
      else if (e.key === "0") restablecer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomEn]);

  // Pointer Events: arrastre con 1 dedo/ratón, pellizco con 2, toque si casi no se movió
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number } | null>(null);
  const gesto = useRef<{ x: number; y: number; movido: boolean; multi: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (panelRef.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.current.size === 1) gesto.current = { x: e.clientX, y: e.clientY, movido: false, multi: false };
    if (punteros.current.size === 2) {
      if (gesto.current) gesto.current.multi = true;
      const [a, b] = [...punteros.current.values()];
      if (!a || !b) return;
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y) };
    }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = punteros.current.get(e.pointerId);
    if (!prev) return;
    const actual = { x: e.clientX, y: e.clientY };
    punteros.current.set(e.pointerId, actual);
    const g = gesto.current;
    if (g && !g.movido && Math.hypot(actual.x - g.x, actual.y - g.y) > UMBRAL_TOQUE) g.movido = true;
    if (punteros.current.size === 2 && pinch.current) {
      const [a, b] = [...punteros.current.values()];
      if (!a || !b) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomEn(vistaRef.current.s * (d / pinch.current.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.current.d = d;
    } else if (punteros.current.size === 1 && vistaRef.current.s > 1 && g?.movido) {
      const v = vistaRef.current;
      setVista(limitar({ ...v, x: v.x + actual.x - prev.x, y: v.y + actual.y - prev.y }));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const tenia = punteros.current.delete(e.pointerId);
    if (punteros.current.size < 2) pinch.current = null;
    const g = gesto.current;
    if (tenia && punteros.current.size === 0) {
      gesto.current = null;
      if (e.type === "pointerup" && g && !g.movido && !g.multi) {
        const obj = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>(".objeto");
        if (obj?.dataset.id) activar(obj.dataset.id);
      }
    }
  };

  // Al redimensionar, vuelve a limitar
  useEffect(() => {
    const r = () => setVista((v) => limitar(v));
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [limitar]);

  const cerrarPanel = useCallback(() => setPanel(null), []);
  const irInicio = (e: React.MouseEvent) => {
    e.preventDefault();
    setPanel(null);
    setMenuAbierto(false);
    restablecer();
  };

  const zoomControles = (
    <div className="zoom-grupo" role="group" aria-label="Zoom">
      <button type="button" className="btn-redondo" onClick={() => zoomEn(vista.s / 1.25)} aria-label="Zoom out" disabled={vista.s <= ZOOM_MIN}>−</button>
      <button type="button" className="btn-redondo" onClick={() => zoomEn(vista.s * 1.25)} aria-label="Zoom in" disabled={vista.s >= ZOOM_MAX}>+</button>
      <button type="button" className="btn-redondo" onClick={restablecer} aria-label="Reset zoom">⟲</button>
    </div>
  );

  const P = panel ? PANELES[panel] : null;

  return (
    <div className="app">
      <header className="banner">
        <h1 className="banner-titulo"><Link to="/" onClick={irInicio} className="banner-enlace">My Room</Link></h1>
        <nav className={`menu ${menuAbierto ? "abierto" : ""}`} aria-label="Main menu">
          <ul id="menu-lista">
            {MENU_ITEMS.map((m) => (
              <li key={m.id}><button type="button" className="menu-item" data-id={m.id} onClick={() => { setPanel(m.objeto); setMenuAbierto(false); }}>{m.label}</button></li>
            ))}
          </ul>
        </nav>
        <div className="banner-controles">
          <div className="solo-escritorio">{zoomControles}</div>
          <button type="button" role="switch" aria-checked={oscuro} aria-label="Dark mode" className="switch" onClick={cambiarTema}>
            <span className="switch-perilla">{oscuro ? "☾" : "☀"}</span>
          </button>
          <button type="button" className="btn-redondo hamburguesa" aria-label="Open menu" aria-expanded={menuAbierto} aria-controls="menu-lista" onClick={() => setMenuAbierto((v) => !v)}>☰</button>
        </div>
      </header>

      <main
        ref={visorRef}
        className="visor"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ cursor: vista.s > 1 ? "grab" : "default" }}
      >
        <div
          ref={escenaRef}
          className={`escenario ${guia ? "guia" : ""}`}
          style={{ transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.s})` }}
        >
          <img src={FONDO.imagen} alt={FONDO.alt} className="fondo" draggable={false} />
          {OBJETOS.map((o) => (
            <button
              key={o.id}
              type="button"
              tabIndex={0}
              data-id={o.id}
              aria-label={o.nombre}
              aria-haspopup={ACCIONES[o.id] && "panel" in ACCIONES[o.id]! ? "dialog" : undefined}
              className={`objeto interactivo ${o.minTap ? "toque-min" : ""} ${tocado === o.id ? "tocado" : ""}`}
              onClick={(e) => { if (e.detail === 0) activar(o.id); /* teclado; el puntero se maneja en onUp */ }}
              style={{
                left: `${o.left}%`,
                top: `${o.top}%`,
                width: `${o.width}%`,
                height: o.height ? `${o.height}%` : undefined,
                zIndex: o.z,
                transform: o.rotate ? `rotate(${o.rotate}deg)` : undefined,
              }}
            >
              <img src={o.imagen} alt={o.alt} draggable={false} style={o.height ? { height: "100%" } : undefined} />
              {guia && <span className="guia-etiqueta">{o.nombre}</span>}
            </button>
          ))}
          <div className="capa-anim" aria-hidden>
            {anims.map((a) => <CapaAnimacion key={a.id} a={a} />)}
          </div>
          <div className="noche" aria-hidden />
        </div>
      </main>

      <div className="barra-flotante">{zoomControles}</div>

      {aviso && (
        <div className="aviso" role="status">
          <span>Turn your phone for a bigger room ↻</span>
          <button type="button" aria-label="Close notice" onClick={() => { setAviso(false); try { sessionStorage.setItem("avisoGiro", "1"); } catch { /* nada */ } }}>✕</button>
        </div>
      )}

      {P && panel && (
        <Panel key={panel} titulo={P.titulo} onCerrar={cerrarPanel}>
          <P.Contenido />
        </Panel>
      )}
    </div>
  );
}
