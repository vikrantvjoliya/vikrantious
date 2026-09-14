import Matter from "matter-js";

export type FruitBody = Matter.Body & { level: number; born: number };

export function createFruitBody(
  x: number,
  y: number,
  radius: number,
  level: number,
  held = false,
): FruitBody {
  // Construct with finite mass first. Constructing a static circle gives it no
  // dynamic mass to restore, so setStatic(false) later produces NaN positions.
  const body = Matter.Bodies.circle(x, y, radius, {
    restitution: 0.15,
    friction: 0.3,
  }) as FruitBody;
  body.level = level;
  body.born = Date.now();
  if (held) {
    Matter.Body.setStatic(body, true);
    body.collisionFilter.mask = 0;
  }
  return body;
}

export function releaseFruit(body: FruitBody) {
  Matter.Body.setStatic(body, false);
  body.collisionFilter.mask = 0xffffffff;
  body.born = Date.now();
}
