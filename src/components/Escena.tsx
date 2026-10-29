import { useCallback, useEffect, useRef, useState } from "react";
import { FONDO, MENU_ITEMS, OBJETOS, TITULO, ZOOM_MAX, ZOOM_MIN } from "@/lib/escena";

type Vista = { s: number; x: number; y: number };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

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
    const centroX = r.left + r.width / 2 - v.x; // centro sin transformar
    const centroY = r.top + r.height / 2 - v.y;
    const px = (cx ?? centroX) - centroX;
    const py = (cy ?? centroY) - centroY;
    const k = s / v.s;
    setVista(limitar({ s, x: px - (px - v.x) * k, y: py - (py - v.y) * k }));
  }, [limitar]);

  const restablecer = () => setVista({ s: 1, x: 0, y: 0 });

  // Rueda / pellizco de trackpad + bloqueo de gestos nativos de iOS
  useEffect(() => {
    const el = visorRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
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

  // Teclado: +, −, 0
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "+" || e.key === "=") zoomEn(vistaRef.current.s * 1.25);
      else if (e.key === "-" || e.key === "_") zoomEn(vistaRef.current.s / 1.25);
      else if (e.key === "0") restablecer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomEn]);

  // Pointer Events: arrastre con 1 dedo/ratón, pellizco con 2
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y) };
    }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = punteros.current.get(e.pointerId);
    if (!prev) return;
    const actual = { x: e.clientX, y: e.clientY };
    punteros.current.set(e.pointerId, actual);
    if (punteros.current.size === 2 && pinch.current) {
      const [a, b] = [...punteros.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomEn(vistaRef.current.s * (d / pinch.current.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.current.d = d;
    } else if (punteros.current.size === 1 && vistaRef.current.s > 1) {
      const v = vistaRef.current;
      setVista(limitar({ ...v, x: v.x + actual.x - prev.x, y: v.y + actual.y - prev.y }));
    }
  };
  const onUp = (e: React.PointerEvent) => {
    punteros.current.delete(e.pointerId);
    if (punteros.current.size < 2) pinch.current = null;
  };

  // Al redimensionar, vuelve a limitar
  useEffect(() => {
    const r = () => setVista((v) => limitar(v));
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [limitar]);

  const zoomControles = (
    <div className="zoom-grupo" role="group" aria-label="Zoom">
      <button type="button" className="btn-redondo" onClick={() => zoomEn(vista.s / 1.25)} aria-label="Alejar" disabled={vista.s <= ZOOM_MIN}>−</button>
      <button type="button" className="btn-redondo" onClick={() => zoomEn(vista.s * 1.25)} aria-label="Acercar" disabled={vista.s >= ZOOM_MAX}>+</button>
      <button type="button" className="btn-redondo" onClick={restablecer} aria-label="Restablecer zoom">⟲</button>
    </div>
  );

  return (
    <div className="app">
      <header className="banner">
        <h1 className="banner-titulo">{TITULO}</h1>
        <nav className={`menu ${menuAbierto ? "abierto" : ""}`} aria-label="Menú principal">
          <ul id="menu-lista">
            {MENU_ITEMS.map((m) => (
              <li key={m.id}><button type="button" className="menu-item" data-id={m.id}>{m.label}</button></li>
            ))}
          </ul>
        </nav>
        <div className="banner-controles">
          <div className="solo-escritorio">{zoomControles}</div>
          <button type="button" role="switch" aria-checked={oscuro} aria-label="Modo oscuro" className="switch" onClick={cambiarTema}>
            <span className="switch-perilla">{oscuro ? "☾" : "☀"}</span>
          </button>
          <button type="button" className="btn-redondo hamburguesa" aria-label="Abrir menú" aria-expanded={menuAbierto} aria-controls="menu-lista" onClick={() => setMenuAbierto((v) => !v)}>☰</button>
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
              className={`objeto ${o.minTap ? "toque-min" : ""}`}
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
          <div className="noche" aria-hidden />
        </div>
      </main>

      <div className="barra-flotante">{zoomControles}</div>

      {aviso && (
        <div className="aviso" role="status">
          <span>Gira tu teléfono para ver el cuarto más grande ↻</span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => { setAviso(false); try { sessionStorage.setItem("avisoGiro", "1"); } catch { /* nada */ } }}>✕</button>
        </div>
      )}
    </div>
  );
}
