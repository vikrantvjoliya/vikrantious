import { test, expect } from "@playwright/test";
import Matter from "matter-js";
import { createFruitBody, releaseFruit } from "../src/game/physics";

test("a held fruit restores finite mass and lands inside the jar", () => {
  const engine = Matter.Engine.create();
  const fruit = createFruitBody(210, 36, 27, 2, true);
  const floor = Matter.Bodies.rectangle(210, 575, 420, 30, { isStatic: true });
  Matter.Composite.add(engine.world, [fruit, floor]);
  for (let i = 0; i < 30; i++) Matter.Engine.update(engine, 1000 / 60);
  expect(fruit.position.y).toBe(36);
  releaseFruit(fruit);
  expect(Number.isFinite(fruit.mass)).toBe(true);
  expect(fruit.inverseMass).toBeGreaterThan(0);
  for (let i = 0; i < 240; i++) {
    Matter.Engine.update(engine, 1000 / 60);
    expect(Number.isFinite(fruit.position.x)).toBe(true);
    expect(Number.isFinite(fruit.position.y)).toBe(true);
  }
  expect(fruit.position.y).toBeGreaterThan(530);
  expect(fruit.position.y).toBeLessThan(537);
  expect(Math.abs(fruit.velocity.y)).toBeLessThan(0.1);
  Matter.Engine.clear(engine);
});

test("a waiting fruit cannot collide with a fruit that has already dropped", () => {
  const engine = Matter.Engine.create();
  const waiting = createFruitBody(210, 36, 27, 2, true);
  const falling = createFruitBody(210, 36, 27, 2);
  let collisions = 0;
  Matter.Events.on(engine, "collisionStart", () => {
    collisions++;
  });
  Matter.Composite.add(engine.world, [waiting, falling]);
  for (let i = 0; i < 60; i++) Matter.Engine.update(engine, 1000 / 60);
  expect(collisions).toBe(0);
  expect(falling.position.y).toBeGreaterThan(100);
  Matter.Engine.clear(engine);
});
