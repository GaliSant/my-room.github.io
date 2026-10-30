import { useState } from "react";
import { Cargando, ErrorAmable } from "@/components/Panel";
import { useAlmacen } from "@/lib/almacen";
import { agregarLibro, type Libro } from "@/lib/datos";

export function Libros() {
  const [tab, setTab] = useState<"search" | "list">("search");
  const [lista, setLista] = useAlmacen<Libro[]>("myroom.books", []);
  const [q, setQ] = useState("");
  const [ultima, setUltima] = useState("");
  const [estado, setEstado] = useState<"inicio" | "cargando" | "listo" | "error">("inicio");
  const [res, setRes] = useState<Libro[]>([]);

  const buscar = async (termino: string) => {
    const t = termino.trim();
    if (!t) return;
    setUltima(t); setEstado("cargando");
    try {
      const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(t)}&fields=key,title,author_name,cover_i&limit=12`);
      if (!r.ok) throw new Error();
      const j = (await r.json()) as { docs: { key: string; title: string; author_name?: string[]; cover_i?: number }[] };
      setRes(j.docs.map((d) => ({ key: d.key, title: d.title, author: d.author_name?.[0] ?? "Unknown author", coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null, read: false })));
      setEstado("listo");
    } catch { setEstado("error"); }
  };
  const leidos = lista.filter((l) => l.read).length;
  const Portada = ({ l }: { l: Libro }) => l.coverUrl ? <img src={l.coverUrl} alt="" className="portada libro" loading="lazy" /> : <div className="portada libro vacia" aria-hidden />;

  return (
    <div>
      <div className="pestanas" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "search"} onClick={() => setTab("search")}>Search</button>
        <button type="button" role="tab" aria-selected={tab === "list"} onClick={() => setTab("list")}>My list ({lista.length})</button>
      </div>
      {tab === "search" ? (
        <div role="tabpanel">
          <form className="fila-busqueda" onSubmit={(e) => { e.preventDefault(); void buscar(q); }}>
            <input className="campo" data-autofocus type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title or author" aria-label="Search books" />
            <button type="submit" className="btn-pastilla" disabled={!q.trim() || estado === "cargando"}>Search</button>
          </form>
          {estado === "inicio" && <p className="tenue estado">Look for a book to add to your list.</p>}
          {estado === "cargando" && <Cargando />}
          {estado === "error" && <ErrorAmable texto="The library didn't answer." onReintentar={() => void buscar(ultima)} />}
          {estado === "listo" && res.length === 0 && <p className="tenue estado">No books found. Try another search.</p>}
          {estado === "listo" && res.length > 0 && (
            <ul className="lista">
              {res.map((l) => {
                const ya = lista.some((x) => x.key === l.key);
                return (
                  <li key={l.key} className="fila">
                    <Portada l={l} />
                    <div className="fila-texto"><strong>{l.title}</strong><span>{l.author}</span></div>
                    <button type="button" className="btn-pastilla" disabled={ya} onClick={() => setLista((ls) => agregarLibro(ls, l))}>{ya ? "Added" : "Add"}</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div role="tabpanel">
          <p className="tenue">{lista.length} books · {leidos} read</p>
          {lista.length === 0 ? <p className="tenue estado">Your list is empty. Add books from Search.</p> : (
            <ul className="lista">
              {lista.map((l) => (
                <li key={l.key} className={`fila ${l.read ? "leido" : ""}`}>
                  <input type="checkbox" className="check" checked={l.read} aria-label={`Mark ${l.title} as read`}
                    onChange={() => setLista((ls) => ls.map((x) => x.key === l.key ? { ...x, read: !x.read } : x))} />
                  <Portada l={l} />
                  <div className="fila-texto"><strong>{l.title}</strong><span>{l.author}</span></div>
                  <button type="button" className="btn-mini" aria-label={`Remove ${l.title}`} onClick={() => setLista((ls) => ls.filter((x) => x.key !== l.key))}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
