import { useState } from "react";
import { useAlmacen } from "@/lib/almacen";
import { diasDelMes, fechaClave, type Nota } from "@/lib/datos";

const SEMANA = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Agenda() {
  const hoy = new Date();
  const [mes, setMes] = useState({ a: hoy.getFullYear(), m: hoy.getMonth() });
  const [elegido, setElegido] = useState(fechaClave(hoy));
  const [notas, setNotas] = useAlmacen<Nota[]>("myroom.notes", []);
  const [texto, setTexto] = useState("");

  const mover = (d: number) => setMes(({ a, m }) => { const f = new Date(a, m + d, 1); return { a: f.getFullYear(), m: f.getMonth() }; });
  const irHoy = () => { setMes({ a: hoy.getFullYear(), m: hoy.getMonth() }); setElegido(fechaClave(hoy)); };
  const delDia = notas.filter((n) => n.date === elegido);
  const agregar = () => {
    const t = texto.trim();
    if (!t) return;
    setNotas((ns) => [...ns, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: elegido, text: t }]);
    setTexto("");
  };
  const titulo = new Date(mes.a, mes.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const elegidoTxt = new Date(`${elegido}T00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="agenda">
      <div className="agenda-nav">
        <button type="button" className="btn-redondo" aria-label="Previous month" onClick={() => mover(-1)}>‹</button>
        <strong aria-live="polite">{titulo}</strong>
        <button type="button" className="btn-redondo" aria-label="Next month" onClick={() => mover(1)}>›</button>
        <button type="button" className="btn-pastilla" data-autofocus onClick={irHoy}>Today</button>
      </div>
      <div className="calendario" role="grid">
        {SEMANA.map((d) => <div key={d} className="cal-sem">{d}</div>)}
        {diasDelMes(mes.a, mes.m).map((d, i) => {
          if (!d) return <div key={`v${i}`} />;
          const k = fechaClave(d);
          const ns = notas.filter((n) => n.date === k);
          return (
            <button
              key={k}
              type="button"
              className={`cal-dia ${k === fechaClave(hoy) ? "hoy" : ""} ${k === elegido ? "elegido" : ""}`}
              aria-label={`${d.toDateString()}${ns.length ? `, ${ns.length} notes` : ""}`}
              aria-pressed={k === elegido}
              onClick={() => setElegido(k)}
            >
              <span>{d.getDate()}</span>
              {ns.length > 0 && <><span className="cal-num">{ns.length}</span><span className="cal-prev">{ns[0]!.text}</span></>}
            </button>
          );
        })}
      </div>
      <div className="notas">
        <h3>{elegidoTxt}</h3>
        {delDia.length === 0 ? <p className="tenue">No notes yet.</p> : (
          <ul>
            {delDia.map((n) => (
              <li key={n.id}>
                <span>{n.text}</span>
                <button type="button" className="btn-mini" aria-label={`Delete note ${n.text}`} onClick={() => setNotas((ns) => ns.filter((x) => x.id !== n.id))}>✕</button>
              </li>
            ))}
          </ul>
        )}
        <form className="fila-busqueda" onSubmit={(e) => { e.preventDefault(); agregar(); }}>
          <input className="campo" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Write a note…" aria-label="New note" maxLength={200} />
          <button type="submit" className="btn-pastilla" disabled={!texto.trim()}>Add</button>
        </form>
      </div>
    </div>
  );
}
