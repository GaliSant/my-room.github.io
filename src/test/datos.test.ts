import { describe, expect, it } from "vitest";
import { agregarLibro, diasDelMes, fechaClave, type Libro } from "@/lib/datos";

const libro = (key: string): Libro => ({ key, title: "T", author: "A", coverUrl: null, read: false });

describe("datos", () => {
  it("does not add the same book twice", () => {
    const l = agregarLibro(agregarLibro([], libro("/works/1")), libro("/works/1"));
    expect(l).toHaveLength(1);
  });
  it("formats note dates as YYYY-MM-DD", () => {
    expect(fechaClave(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
  it("builds October 2026 starting on Thursday with 31 days", () => {
    const c = diasDelMes(2026, 9);
    expect(c.slice(0, 4).every((x) => x === null)).toBe(true);
    expect(c.filter(Boolean)).toHaveLength(31);
  });
});
