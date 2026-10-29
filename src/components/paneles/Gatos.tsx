import { useState } from "react";
import { FRASES_GATO } from "@/lib/datos";
import { Cargando, ErrorAmable } from "@/components/Panel";

const nuevaUrl = () => {
  const frase = FRASES_GATO[Math.floor(Math.random() * FRASES_GATO.length)] ?? "Meow";
  return `https://cataas.com/cat/says/${encodeURIComponent(frase)}?fontSize=40&fontColor=white&t=${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export function Gatos() {
  const [url, setUrl] = useState(nuevaUrl);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const otro = () => { setEstado("cargando"); setUrl(nuevaUrl()); };

  return (
    <div className="gatos">
      <div className="gato-marco">
        {estado === "cargando" && <Cargando />}
        {estado === "error" && <ErrorAmable texto="The cat ran away. Let's try again!" onReintentar={otro} />}
        <img
          key={url}
          src={url}
          alt="Random cat meme"
          className={estado === "listo" ? "" : "oculto"}
          onLoad={() => setEstado("listo")}
          onError={() => setEstado("error")}
        />
      </div>
      <button type="button" className="btn-pastilla" data-autofocus onClick={otro} disabled={estado === "cargando"}>Another cat</button>
    </div>
  );
}
