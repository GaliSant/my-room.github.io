import { useEffect, useRef, useState } from "react";
import { Cargando, ErrorAmable } from "@/components/Panel";

type Cancion = { id: number; nombre: string; artista: string; portada: string; preview: string | null };

export function Musica() {
  const [q, setQ] = useState("");
  const [ultima, setUltima] = useState("");
  const [estado, setEstado] = useState<"inicio" | "cargando" | "listo" | "error">("inicio");
  const [res, setRes] = useState<Cancion[]>([]);
  const [sonando, setSonando] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { audio.current?.pause(); audio.current = null; }, []);

  const buscar = async (termino: string) => {
    const t = termino.trim();
    if (!t) return;
    setUltima(t); setEstado("cargando");
    try {
      const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(t)}&media=music&entity=song&limit=10`);
      if (!r.ok) throw new Error();
      const j = (await r.json()) as { results: { trackId: number; trackName: string; artistName: string; artworkUrl100?: string; previewUrl?: string }[] };
      setRes(j.results.map((x) => ({ id: x.trackId, nombre: x.trackName, artista: x.artistName, portada: (x.artworkUrl100 ?? "").replace("100x100", "300x300"), preview: x.previewUrl ?? null })));
      setEstado("listo");
    } catch { setEstado("error"); }
  };

  const alternar = (c: Cancion) => {
    if (!c.preview) return;
    if (sonando === c.id) { audio.current?.pause(); setSonando(null); return; }
    audio.current?.pause();
    const a = new Audio(c.preview);
    a.onended = () => setSonando(null);
    audio.current = a;
    a.play().then(() => setSonando(c.id)).catch(() => setSonando(null));
  };

  return (
    <div>
      <form className="fila-busqueda" onSubmit={(e) => { e.preventDefault(); void buscar(q); }}>
        <input className="campo" data-autofocus type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Song or artist" aria-label="Search songs" />
        <button type="submit" className="btn-pastilla" disabled={!q.trim() || estado === "cargando"}>Search</button>
      </form>
      {estado === "inicio" && <p className="tenue estado">Find a song and listen to a 30-second preview.</p>}
      {estado === "cargando" && <Cargando />}
      {estado === "error" && <ErrorAmable texto="We couldn't reach the music store." onReintentar={() => void buscar(ultima)} />}
      {estado === "listo" && res.length === 0 && <p className="tenue estado">No songs found. Try another search.</p>}
      {estado === "listo" && res.length > 0 && (
        <ul className="lista">
          {res.map((c) => (
            <li key={c.id} className={`fila ${sonando === c.id ? "activa" : ""}`}>
              {c.portada ? <img src={c.portada} alt="" className="portada" /> : <div className="portada vacia" />}
              <div className="fila-texto"><strong>{c.nombre}</strong><span>{c.artista}</span>{sonando === c.id && <span className="sonando">Now playing</span>}</div>
              <button type="button" className="btn-redondo" disabled={!c.preview} onClick={() => alternar(c)}
                aria-label={!c.preview ? "No preview available" : sonando === c.id ? `Pause ${c.nombre}` : `Play ${c.nombre}`}>
                {sonando === c.id ? "❚❚" : "▶"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
