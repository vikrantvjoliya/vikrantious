import { useEffect, useState } from "react";

type Bloom = {
  id: number;
  x: number;
  y: number;
  petals: number;
  rotation: number;
  color: string;
};
const colors = ["#8eaa73", "#d9b06e", "#c9826a", "#9a8db7"];

export default function FlowerClicks() {
  const [blooms, setBlooms] = useState<Bloom[]>([]);
  useEffect(() => {
    let id = 0;
    const add = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (
        (event.target as Element).closest(
          "a,button,input,textarea,[role=button],[role=menuitem],[role=menuitemradio]",
        )
      )
        return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const bloom = {
        id: ++id,
        x: event.clientX,
        y: event.clientY,
        petals: 5 + (id % 4),
        rotation: (id * 29) % 90,
        color: colors[id % colors.length],
      };
      setBlooms((current) => [...current.slice(-7), bloom]);
      window.setTimeout(
        () =>
          setBlooms((current) =>
            current.filter((item) => item.id !== bloom.id),
          ),
        1500,
      );
    };
    window.addEventListener("pointerdown", add);
    return () => window.removeEventListener("pointerdown", add);
  }, []);
  return (
    <div className="flower-clicks" aria-hidden="true">
      {blooms.map((bloom) => (
        <svg
          key={bloom.id}
          className="click-bloom"
          style={{
            left: bloom.x,
            top: bloom.y,
            color: bloom.color,
            transform: `translate(-50%,-50%) rotate(${bloom.rotation}deg)`,
          }}
          viewBox="-30 -30 60 60"
        >
          {Array.from({ length: bloom.petals }, (_, index) => (
            <ellipse
              key={index}
              rx="6"
              ry="16"
              cy="-13"
              fill="currentColor"
              opacity={0.7 + (index / bloom.petals) * 0.25}
              transform={`rotate(${(index * 360) / bloom.petals})`}
            />
          ))}
          <circle
            r="6"
            fill="var(--page)"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ))}
    </div>
  );
}
