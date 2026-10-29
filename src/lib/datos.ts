// Lógica pura (sin React) para agenda y libros.
export type Nota = { id: string; date: string; text: string };
export type Libro = { key: string; title: string; author: string; coverUrl: string | null; read: boolean };

export const fechaClave = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Casillas del mes (semana inicia en domingo); null = hueco antes del día 1.
export function diasDelMes(anio: number, mes: number): (Date | null)[] {
  const primero = new Date(anio, mes, 1).getDay();
  const total = new Date(anio, mes + 1, 0).getDate();
  const celdas: (Date | null)[] = Array.from({ length: primero }, () => null);
  for (let d = 1; d <= total; d++) celdas.push(new Date(anio, mes, d));
  return celdas;
}

export function agregarLibro(lista: Libro[], libro: Libro): Libro[] {
  return lista.some((l) => l.key === libro.key) ? lista : [...lista, libro];
}

export const FRASES_GATO = [
  "Feed me now",
  "I knocked it over",
  "Monday again?",
  "Not my problem",
  "Nap time forever",
  "Pet me. Stop.",
  "I own this room",
  "Zero regrets",
  "Is that tuna?",
  "Do not disturb",
];
