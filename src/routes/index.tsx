import { createFileRoute } from "@tanstack/react-router";
import { Escena } from "@/components/Escena";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mi cuarto — escena interactiva" },
      { name: "description", content: "Una recámara rosa ilustrada que puedes explorar con zoom y modo noche." },
      { property: "og:title", content: "Mi cuarto — escena interactiva" },
      { property: "og:description", content: "Una recámara rosa ilustrada que puedes explorar con zoom y modo noche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Escena,
});
