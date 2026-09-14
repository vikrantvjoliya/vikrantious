import { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import Matter from "matter-js";
import PageHeading from "../components/PageHeading";
const { Engine, Runner, Bodies, Body, Composite, Events } = Matter;
const fruits = [
  { radius: 14, color: "#e6a2a2", label: "Cherry", points: 1 },
  { radius: 20, color: "#eac492", label: "Apricot", points: 3 },
  { radius: 27, color: "#c2aed8", label: "Plum", points: 6 },
  { radius: 34, color: "#b7cf8c", label: "Pear", points: 10 },
  { radius: 43, color: "#e8a685", label: "Peach", points: 15 },
  { radius: 53, color: "#d6d996", label: "Apple", points: 21 },
  { radius: 65, color: "#e6c57a", label: "Melon", points: 28 },
  { radius: 80, color: "#8bb58a", label: "Watermelon", points: 36 },
];
type FruitBody = Matter.Body & { level?: number; born?: number };
export default function SuikaGamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useRef<{
    move: (delta: number) => void;
    aim: (x: number) => void;
    drop: () => void;
    restart: () => void;
  }>({ move: () => {}, aim: () => {}, drop: () => {}, restart: () => {} });
  const [score, setScore] = useState(0);
  const [next, setNext] = useState(0);
  const [over, setOver] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const width = 420;
    const height = 560;
    canvas.width = width;
    canvas.height = height;
    const engine = Engine.create();
    engine.gravity.y = 1;
    const runner = Runner.create();
    let current: FruitBody | null = null;
    let total = 0;
    let ended = false;
    let queued = 0;
    let dropTimer: ReturnType<typeof setTimeout> | undefined;
    let animation = 0;
    let disposed = false;
    const walls = [
      Bodies.rectangle(width / 2, height + 15, width, 30, { isStatic: true }),
      Bodies.rectangle(-15, height / 2, 30, height * 2, { isStatic: true }),
      Bodies.rectangle(width + 15, height / 2, 30, height * 2, {
        isStatic: true,
      }),
    ];
    const random = () => Math.floor(Math.random() * 4);
    const fruit = (x: number, y: number, level: number, isStatic = false) => {
      const body: FruitBody = Bodies.circle(x, y, fruits[level].radius, {
        isStatic,
        restitution: 0.15,
        friction: 0.3,
      });
      body.level = level;
      body.born = Date.now();
      Composite.add(engine.world, body);
      return body;
    };
    const spawn = () => {
      if (ended || disposed) return;
      current = fruit(width / 2, 36, queued, true);
      queued = random();
      setNext(queued);
      setReady(true);
    };
    const moveTo = (x: number) => {
      if (!current || ended) return;
      const radius = fruits[current.level!].radius;
      Body.setPosition(current, {
        x: Math.max(radius, Math.min(width - radius, x)),
        y: 36,
      });
    };
    const drop = () => {
      if (!current || ended) return;
      Body.setStatic(current, false);
      current.born = Date.now();
      current = null;
      setReady(false);
      dropTimer = setTimeout(spawn, 650);
    };
    const restart = () => {
      clearTimeout(dropTimer);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      Composite.add(engine.world, walls);
      total = 0;
      ended = false;
      current = null;
      setScore(0);
      setOver(false);
      setReady(false);
      queued = random();
      spawn();
    };
    controls.current = {
      aim: moveTo,
      move: (delta) => moveTo((current?.position.x || width / 2) + delta),
      drop,
      restart,
    };
    const collide = (event: Matter.IEventCollision<Matter.Engine>) => {
      if (ended) return;
      const merged = new Set<number>();
      for (const { bodyA, bodyB } of event.pairs) {
        const a = bodyA as FruitBody;
        const b = bodyB as FruitBody;
        if (
          a.level === undefined ||
          b.level !== a.level ||
          a.level >= fruits.length - 1 ||
          a.isStatic ||
          b.isStatic ||
          merged.has(a.id) ||
          merged.has(b.id)
        )
          continue;
        merged.add(a.id);
        merged.add(b.id);
        Composite.remove(engine.world, [a, b]);
        const level = a.level + 1;
        fruit(
          (a.position.x + b.position.x) / 2,
          (a.position.y + b.position.y) / 2,
          level,
        );
        total += fruits[level].points;
        setScore(total);
      }
    };
    Events.on(engine, "collisionStart", collide);
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#c4cfb5";
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(0, 85);
      ctx.lineTo(width, 85);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const body of Composite.allBodies(engine.world) as FruitBody[]) {
        if (body.level === undefined) continue;
        const f = fruits[body.level];
        const { x, y } = body.position;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(x, y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fffef6";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#506343";
        ctx.beginPath();
        ctx.ellipse(x + 4, y - f.radius + 4, 5, 2.5, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#49533f";
        ctx.beginPath();
        ctx.arc(x - 4, y, 1.5, 0, Math.PI * 2);
        ctx.arc(x + 4, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        if (
          !ended &&
          !body.isStatic &&
          Date.now() - (body.born || 0) > 3000 &&
          body.speed < 0.15 &&
          y - f.radius < 85
        ) {
          ended = true;
          setOver(true);
        }
      }
      animation = requestAnimationFrame(draw);
    };
    restart();
    Runner.run(runner, engine);
    draw();
    return () => {
      disposed = true;
      clearTimeout(dropTimer);
      cancelAnimationFrame(animation);
      Runner.stop(runner);
      Events.off(engine, "collisionStart", collide);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);
  return (
    <div className="content-page">
      <PageHeading
        title="A little play. A fresh perspective."
        description="Meet Fruity Fall. Match, merge, and enjoy a moment away."
      />
      <div className="game-layout">
        <section>
          <div className="game-stats">
            <div>
              <span>YOUR SCORE</span>
              <strong aria-live="polite">{score}</strong>
            </div>
            <div>
              <span>UP NEXT</span>
              <strong style={{ fontSize: 20, color: "#687b55" }}>
                {fruits[next].label}
              </strong>
            </div>
            <Button onClick={() => controls.current.restart()}>Restart</Button>
          </div>
          <div className="game-board">
            <canvas
              ref={canvasRef}
              tabIndex={0}
              aria-label="Fruity Fall game. Left and right arrows to move, space or enter to drop."
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const target = ((e.clientX - rect.left) * 420) / rect.width;
                controls.current.aim(target);
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                controls.current.aim(
                  ((e.clientX - rect.left) * 420) / rect.width,
                );
                controls.current.drop();
              }}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight", " ", "Enter"].includes(e.key)) {
                  e.preventDefault();
                  if (e.key === "ArrowLeft") controls.current.move(-18);
                  else if (e.key === "ArrowRight") controls.current.move(18);
                  else controls.current.drop();
                }
              }}
            />
            {over && (
              <div className="game-over" role="status">
                <h2>A fruitful little break.</h2>
                <p>You scored {score} points.</p>
                <Button
                  variant="contained"
                  onClick={() => controls.current.restart()}
                >
                  Play again
                </Button>
              </div>
            )}
          </div>
          <div className="game-controls">
            <Button
              variant="outlined"
              aria-label="Move fruit left"
              onClick={() => controls.current.move(-25)}
              disabled={!ready || over}
            >
              ←
            </Button>
            <Button
              variant="contained"
              onClick={() => controls.current.drop()}
              disabled={!ready || over}
            >
              {ready ? "Drop fruit" : "Next fruit…"}
            </Button>
            <Button
              variant="outlined"
              aria-label="Move fruit right"
              onClick={() => controls.current.move(25)}
              disabled={!ready || over}
            >
              →
            </Button>
          </div>
        </section>
        <aside className="game-help">
          <span className="eyebrow">NO RUSH. JUST PLAY.</span>
          <h2 style={{ marginTop: 15 }}>Small things grow.</h2>
          <p>
            Drop a fruit into the jar. When two of the same kind touch, they
            merge into something bigger.
          </p>
          <p>
            Keep the fruit below the dotted line and see how far you can grow.
          </p>
          <p>
            Move with your pointer or arrow keys. Click, press space, or use the
            buttons to drop.
          </p>
          <span className="sparkle" aria-hidden="true">
            ✳
          </span>
        </aside>
      </div>
    </div>
  );
}
