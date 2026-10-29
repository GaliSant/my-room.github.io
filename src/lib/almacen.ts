import { useEffect, useRef, useState } from "react";

export function leer<T>(clave: string, inicial: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : inicial;
  } catch {
    return inicial;
  }
}

export function guardar(clave: string, valor: unknown) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sigue en memoria */ }
}

// Estado que persiste en localStorage; si no hay almacenamiento, vive solo en la sesión.
export function useAlmacen<T>(clave: string, inicial: T) {
  const [valor, setValor] = useState<T>(inicial);
  const cargado = useRef(false);
  useEffect(() => { setValor(leer(clave, inicial)); cargado.current = true; }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (cargado.current) guardar(clave, valor); }, [clave, valor]);
  return [valor, setValor] as const;
}
