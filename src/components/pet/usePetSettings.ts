import { useEffect, useState } from "react";
import { constrainPet, type PetPosition } from "./geometry";

export type PetSettings = PetPosition & {
  enabled: boolean;
  name: string;
  character: "warrior" | "electric";
  color: string;
  locked: boolean;
  muted: boolean;
  motion: boolean;
};
const key = "vk-companion-v1";
function readSettings(): PetSettings {
  const defaults: PetSettings = {
    enabled: false,
    name: "Rune",
    character: "warrior",
    color: "#c95642",
    locked: false,
    muted: true,
    motion: true,
    size: 160,
    x: window.innerWidth - 196,
    y: window.innerHeight - 260,
  };
  try {
    const s = JSON.parse(localStorage.getItem(key) || "{}");
    if (!s || typeof s !== "object") return defaults;
    for (const field of ["enabled", "locked", "muted", "motion"] as const) {
      if (typeof s[field] === "boolean") defaults[field] = s[field];
    }
    for (const field of ["x", "y", "size"] as const) {
      if (typeof s[field] === "number" && Number.isFinite(s[field]))
        defaults[field] = s[field];
    }
    if (typeof s.name === "string" && s.name.trim())
      defaults.name = s.name.trim().slice(0, 24);
    if (s.character === "electric") defaults.character = s.character;
    if (typeof s.color === "string" && /^#[\da-f]{6}$/i.test(s.color))
      defaults.color = s.color;
  } catch {
    /* Storage may be unavailable or contain an older value. */
  }
  return { ...defaults, ...constrainPet(defaults) };
}
export function usePetSettings() {
  const [settings, setSettings] = useState(readSettings);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(settings));
    } catch {
      /* Session still works. */
    }
  }, [settings]);
  useEffect(() => {
    const resize = () => setSettings((s) => ({ ...s, ...constrainPet(s) }));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return [settings, setSettings] as const;
}
