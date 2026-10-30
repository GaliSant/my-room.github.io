import { createFileRoute } from "@tanstack/react-router";
import { Escena } from "@/components/Escena";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Room" },
      { name: "description", content: "An illustrated pink bedroom to explore: cat memes, a calendar, music and books." },
      { property: "og:title", content: "My Room" },
      { property: "og:description", content: "An illustrated pink bedroom to explore: cat memes, a calendar, music and books." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Escena,
});
