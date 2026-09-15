export type PetPosition = { x: number; y: number; size: number };
export function constrainPet(
  position: PetPosition,
  width = window.innerWidth,
  height = window.innerHeight,
): PetPosition {
  const size = Math.min(
    Math.max(96, position.size),
    240,
    Math.max(64, width - 24),
    Math.max(64, (height - 70) / 1.2),
  );
  return {
    size,
    x: Math.max(12, Math.min(position.x, width - size - 12)),
    y: Math.max(36, Math.min(position.y, height - size * 1.2 - 52)),
  };
}
