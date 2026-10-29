// Configuración central de la escena. Ajusta posiciones aquí (todo en % del escenario).
import cuarto from "@/assets/Cuarto.jpg.asset.json";
import cama from "@/assets/Cama.png.asset.json";
import cel from "@/assets/Cel.png.asset.json";
import estante1 from "@/assets/Estante1.png.asset.json";
import estante2 from "@/assets/Estante2.png.asset.json";
import pecera from "@/assets/Pecera.png.asset.json";
import computadora from "@/assets/Computadora.png.asset.json";
import grabadora from "@/assets/Grabadora.png.asset.json";
import cuadro from "@/assets/Cuadro.png.asset.json";
import librero from "@/assets/Librero.jpg.asset.json";
import planta from "@/assets/Planta.png.asset.json";

export type PanelId = "cel" | "computadora" | "grabadora" | "librero";
export type AnimId = "zzz" | "cuadro" | "murcielago" | "pez";

// Cada opción del menú abre el panel del objeto indicado.
export const MENU_ITEMS: { id: string; label: string; objeto: PanelId }[] = [
  { id: "music", label: "Music", objeto: "grabadora" },
  { id: "books", label: "Books", objeto: "librero" },
  { id: "calendar", label: "Calendar", objeto: "computadora" },
];

// Qué hace cada objeto al tocarlo (los que no aparecen solo dan retroalimentación).
export const ACCIONES: Record<string, { panel: PanelId } | { anim: AnimId }> = {
  cel: { panel: "cel" },
  computadora: { panel: "computadora" },
  grabadora: { panel: "grabadora" },
  librero: { panel: "librero" },
  cama: { anim: "zzz" },
  cuadro: { anim: "cuadro" },
  "planta-izq": { anim: "murcielago" },
  "planta-der": { anim: "murcielago" },
  pecera: { anim: "pez" },
};

export const FONDO = { imagen: cuarto.url, alt: "Recámara rosa con cortinas al centro" };
export const PROPORCION = 736 / 552; // proporción de Cuarto.jpg

export type Objeto = {
  id: string;
  nombre: string;
  imagen: string;
  left: number;
  top: number;
  width: number;
  height?: number; // opcional: si se omite, alto automático
  rotate?: number; // grados
  z: number;
  alt: string;
  minTap?: boolean; // área táctil mínima de 44x44 px
};

export const OBJETOS: Objeto[] = [
  { id: "cuadro", nombre: "Cuadro", imagen: cuadro.url, left: 6.8, top: 17.5, width: 18, z: 2, alt: "Cuadro con marco blanco de una dama antigua" },
  { id: "librero", nombre: "Librero", imagen: librero.url, left: 70.5, top: 10.5, width: 24, height: 83.5, z: 3, alt: "Librero rosa lleno de libros" },
  { id: "planta-izq", nombre: "Planta", imagen: planta.url, left: 24, top: 0, width: 13.5, z: 4, alt: "Planta colgante del techo" },
  { id: "planta-der", nombre: "Planta", imagen: planta.url, left: 61, top: 0, width: 13.5, z: 4, alt: "Planta colgante del techo" },
  { id: "estante1", nombre: "Estante 1", imagen: estante1.url, left: 0, top: 67.5, width: 16.5, z: 5, alt: "Cajonera blanca con estrellas rosas" },
  { id: "estante2", nombre: "Estante 2", imagen: estante2.url, left: 17, top: 64.5, width: 20, z: 6, alt: "Buró blanco con cajón y hueco abierto" },
  { id: "cama", nombre: "Cama", imagen: cama.url, left: 36.5, top: 49, width: 29, z: 7, alt: "Cama con cobija amarilla y moños rosas" },
  { id: "pecera", nombre: "Pecera", imagen: pecera.url, left: 0, top: 55, width: 14, z: 8, alt: "Pecera con plantas" },
  { id: "computadora", nombre: "Computadora", imagen: computadora.url, left: 19.5, top: 47.5, width: 19, z: 9, alt: "Computadora rosa con teclado" },
  { id: "grabadora", nombre: "Grabadora", imagen: grabadora.url, left: 22.5, top: 77.5, width: 8.5, z: 10, alt: "Grabadora rosa", minTap: true },
  { id: "cel", nombre: "Cel", imagen: cel.url, left: 53.5, top: 80, width: 4, rotate: -62, z: 11, alt: "Celular rosa de tapa", minTap: true },
];

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;
export const UMBRAL_TOQUE = 8; // px: más movimiento que esto es arrastre, no toque
