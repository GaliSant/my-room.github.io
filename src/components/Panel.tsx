import { useEffect, useRef, type ReactNode } from "react";

const ENFOCABLES = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

export function Panel({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const el = caja.current;
    (el?.querySelector<HTMLElement>("[data-autofocus]") ?? el)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onCerrar(); return; }
      if (e.key !== "Tab" || !el) return;
      const f = [...el.querySelectorAll<HTMLElement>(ENFOCABLES)].filter((x) => x.offsetParent !== null);
      if (!f.length) { e.preventDefault(); return; }
      const primero = f[0]!, ultimo = f[f.length - 1]!;
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === el)) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); previo?.focus?.(); };
  }, [onCerrar]);

  return (
    <div className="panel-fondo" onPointerDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div ref={caja} className="panel" role="dialog" aria-modal="true" aria-labelledby="panel-titulo" tabIndex={-1}>
        <div className="panel-cabeza">
          <h2 id="panel-titulo">{titulo}</h2>
          <button type="button" className="btn-redondo" aria-label="Close" onClick={onCerrar}>✕</button>
        </div>
        <div className="panel-cuerpo">{children}</div>
      </div>
    </div>
  );
}

export function Cargando() {
  return <div className="cargando" role="status"><span className="spinner" aria-hidden /> Loading…</div>;
}

export function ErrorAmable({ texto, onReintentar }: { texto: string; onReintentar: () => void }) {
  return (
    <div className="estado">
      <p>{texto}</p>
      <button type="button" className="btn-pastilla" onClick={onReintentar}>Try again</button>
    </div>
  );
}
