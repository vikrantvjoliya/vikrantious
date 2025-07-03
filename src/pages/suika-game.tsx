import React, { useEffect, useRef } from "react";

const MATTER_URL = "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
const TONE_URL = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js";

const SuikaGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const nextFruitRef = useRef<HTMLDivElement>(null);
  const gameOverModalRef = useRef<HTMLDivElement>(null);
  const finalScoreRef = useRef<HTMLSpanElement>(null);
  const restartButtonRef = useRef<HTMLButtonElement>(null);

  // Helper to load a script
  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    Promise.all([loadScript(MATTER_URL), loadScript(TONE_URL)]).then(() => {
      // @ts-ignore
      const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = window.Matter;
      // @ts-ignore
      const Tone = window.Tone;

      const canvas = canvasRef.current!;
      const scoreElement = scoreRef.current!;
      const nextFruitContainer = nextFruitRef.current!;
      const gameOverModal = gameOverModalRef.current!;
      const finalScoreElement = finalScoreRef.current!;
      const restartButton = restartButtonRef.current!;

      // Responsive sizing
      function getGameSize() {
        const width = Math.min(window.innerWidth * 0.95, 500); // was 900
        return { width, height: width * 1.6 };
      }
      let { width: gameWidth, height: gameHeight } = getGameSize();
      canvas.width = gameWidth;
      canvas.height = gameHeight;

      // Matter.js setup
      const engine = Engine.create();
      const world = engine.world;
      world.gravity.y = 0.85;

      const render = Render.create({
        canvas,
        engine,
        options: {
          width: gameWidth,
          height: gameHeight,
          wireframes: false,
          background: "transparent",
        },
      });

      const runner = Runner.create();
      Runner.run(runner, engine);
      Render.run(render);

      // Sound setup
      let soundsReady = false;
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 },
      }).toDestination();
      const ensureAudio = () => {
        if (Tone.context.state !== "running") Tone.start();
        soundsReady = true;
      };
      const dropSound = () => {
        ensureAudio();
        if (!soundsReady) return;
        synth.triggerAttackRelease("C4", "8n", Tone.now());
      };
      const mergeSound = (level: number) => {
        ensureAudio();
        if (!soundsReady) return;
        const notes = [
          "C4", "E4", "G4", "C5", "E5", "G5", "A5", "B5", "C6", "D6", "E6",
        ];
        synth.triggerAttackRelease(notes[level] || "E6", "8n", Tone.now() + 0.05);
      };
      const startAudio = () => {
        ensureAudio();
        document.body.removeEventListener("click", startAudio);
        document.body.removeEventListener("touchstart", startAudio);
        canvas.removeEventListener("click", startAudio);
        canvas.removeEventListener("touchstart", startAudio);
      };
      document.body.addEventListener("click", startAudio);
      document.body.addEventListener("touchstart", startAudio);
      canvas.addEventListener("click", startAudio);
      canvas.addEventListener("touchstart", startAudio);

      // Game state
      let currentFruit: any = null;
      let currentFruitBody: any = null;
      let nextFruitType: any;
      let score = 0;
      let disableAction = false;
      let gameOver = false;

      const FRUITS = [
        { index: 0, color: "#FFB6C1", radius: gameWidth * 0.03, score: 1 },
        { index: 1, color: "#FFD580", radius: gameWidth * 0.04, score: 3 },
        { index: 2, color: "#B5EAD7", radius: gameWidth * 0.055, score: 6 },
        { index: 3, color: "#C7CEEA", radius: gameWidth * 0.065, score: 10 },
        { index: 4, color: "#FFDAC1", radius: gameWidth * 0.08, score: 15 },
        { index: 5, color: "#E2F0CB", radius: gameWidth * 0.095, score: 21 },
        { index: 6, color: "#B5ADEB", radius: gameWidth * 0.11, score: 28 },
        { index: 7, color: "#FF9AA2", radius: gameWidth * 0.13, score: 36 },
        { index: 8, color: "#F6DFEB", radius: gameWidth * 0.15, score: 45 },
        { index: 9, color: "#B5EAD7", radius: gameWidth * 0.2, score: 66 },
      ];

      const wallThickness = 30;
      const topBoundaryY = gameHeight * 0.15;

      // World boundaries
      const ground = Bodies.rectangle(
        gameWidth / 2,
        gameHeight + wallThickness / 2,
        gameWidth,
        wallThickness,
        { isStatic: true, render: { visible: false } }
      );
      const leftWall = Bodies.rectangle(
        -wallThickness / 2,
        gameHeight / 2,
        wallThickness,
        gameHeight,
        { isStatic: true, render: { visible: false } }
      );
      const rightWall = Bodies.rectangle(
        gameWidth + wallThickness / 2,
        gameHeight / 2,
        wallThickness,
        gameHeight,
        { isStatic: true, render: { visible: false } }
      );
      World.add(world, [ground, leftWall, rightWall]);

      // Custom rendering for fruits
      Events.on(render, "afterRender", (event: any) => {
        const context = event.source.context;
        context.save();
        // Draw Game Over Line
        context.beginPath();
        context.moveTo(0, topBoundaryY);
        context.lineTo(gameWidth, topBoundaryY);
        context.strokeStyle = "rgba(239, 83, 80, 0.6)";
        context.lineWidth = 3;
        context.setLineDash([10, 10]);
        context.stroke();
        context.setLineDash([]);
        // Draw Fruits
        const bodies = Composite.allBodies(engine.world);
        for (let i = 0; i < bodies.length; i++) {
          const body = bodies[i];
          if (body.label.startsWith("fruit")) {
            const { x, y } = body.position;
            const radius = body.circleRadius;
            // Shadow
            context.save();
            context.globalAlpha = 0.18;
            context.beginPath();
            context.arc(x, y + radius * 0.18, radius * 1.08, 0, 2 * Math.PI);
            context.fillStyle = "#000";
            context.filter = "blur(2px)";
            context.fill();
            context.restore();
            // Main circle
            context.save();
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fillStyle = body.fruitType.color;
            context.shadowColor = "#fff";
            context.shadowBlur = 8;
            context.fill();
            // Border
            context.lineWidth = 4;
            context.strokeStyle = "#fff";
            context.stroke();
            context.restore();
          }
        }
        context.restore();
      });

      // Fruit logic
      function createFruit(x: number, y: number, fruitType: any, isStatic = false) {
        const body = Bodies.circle(x, y, fruitType.radius, {
          isStatic,
          restitution: 0.2,
          friction: 0.4,
          label: `fruit-${fruitType.index}`,
          render: { fillStyle: "transparent", strokeStyle: "transparent" },
        });
        body.fruitType = fruitType;
        return body;
      }
      function chooseNextFruit() {
        return FRUITS[Math.floor(Math.random() * 5)];
      }
      function updateNextFruitUI() {
        nextFruitContainer.innerHTML = "";
        const circle = document.createElement("div");
        circle.style.width = nextFruitType.radius * 2 + "px";
        circle.style.height = nextFruitType.radius * 2 + "px";
        circle.style.background = nextFruitType.color;
        circle.style.borderRadius = "50%";
        circle.style.margin = "0 auto";
        circle.style.boxShadow = "0 2px 8px #fff, 0 2px 8px #0002";
        circle.style.border = "3px solid #fff";
        nextFruitContainer.appendChild(circle);
      }
      function addCurrentFruit() {
        if (gameOver) return;
        currentFruit = nextFruitType || chooseNextFruit();
        nextFruitType = chooseNextFruit();
        updateNextFruitUI();
        const x = gameWidth / 2;
        const y = 50;
        currentFruitBody = createFruit(x, y, currentFruit, true);
        World.add(world, currentFruitBody);
      }

      // Controls
      function moveFruit(x: number) {
        if (!currentFruitBody || gameOver) return;
        const radius = currentFruitBody.circleRadius;
        const clampedX = Math.max(radius, Math.min(gameWidth - radius, x));
        Body.setPosition(currentFruitBody, { x: clampedX, y: currentFruitBody.position.y });
      }
      const mouseMoveHandler = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        moveFruit(e.clientX - rect.left);
      };
      const touchMoveHandler = (e: TouchEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        moveFruit(e.touches[0].clientX - rect.left);
      };
      canvas.addEventListener("mousemove", mouseMoveHandler);
      canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });
      function dropFruit() {
        if (!currentFruitBody || disableAction || gameOver) return;
        Body.setStatic(currentFruitBody, false);
        dropSound();
        currentFruitBody = null;
        disableAction = true;
        setTimeout(() => {
          if (!gameOver) {
            addCurrentFruit();
            disableAction = false;
          }
        }, 700);
      }
      const clickHandler = () => dropFruit();
      const touchEndHandler = () => dropFruit();
      canvas.addEventListener("click", clickHandler);
      canvas.addEventListener("touchend", touchEndHandler);

      // Collision logic
      Events.on(engine, "collisionStart", (event: any) => {
        if (gameOver) return;
        const pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          const { bodyA, bodyB } = pair;
          if (
            bodyA.label.startsWith("fruit") &&
            bodyB.label.startsWith("fruit")
          ) {
            const typeA = bodyA.fruitType;
            const typeB = bodyB.fruitType;
            if (typeA.index === typeB.index && typeA.index < FRUITS.length - 1) {
              World.remove(world, bodyA);
              World.remove(world, bodyB);
              const newIndex = typeA.index + 1;
              const newFruitType = FRUITS[newIndex];
              const newX = (bodyA.position.x + bodyB.position.x) / 2;
              const newY = (bodyA.position.y + bodyB.position.y) / 2;
              const newFruit = createFruit(newX, newY, newFruitType);
              World.add(world, newFruit);
              Body.applyForce(newFruit, newFruit.position, { x: 0, y: -0.02 });
              score += newFruitType.score;
              scoreElement.textContent = score.toString();
              mergeSound(newIndex);
            }
          }
        }
      });

      // Game over logic
      function checkGameOver() {
        if (gameOver) return;
        const bodies = Composite.allBodies(engine.world);
        for (let i = 0; i < bodies.length; i++) {
          const body = bodies[i];
          if (
            body.label.startsWith("fruit") &&
            !body.isStatic &&
            body !== currentFruitBody
          ) {
            if (
              body.speed < 0.1 &&
              body.position.y - body.circleRadius < topBoundaryY
            ) {
              body.dangerCount = (body.dangerCount || 0) + 1;
              if (body.dangerCount >= 2) {
                endGame();
                return;
              }
            } else {
              body.dangerCount = 0;
            }
          }
        }
      }
      let gameOverInterval = setInterval(checkGameOver, 1000);
      function endGame() {
        if (gameOver) return;
        gameOver = true;
        disableAction = true;
        clearInterval(gameOverInterval);
        Runner.stop(runner);
        finalScoreElement.textContent = score.toString();
        gameOverModal.style.display = "flex";
      }

      // Restart logic
      function restartGame() {
        World.clear(world, false);
        World.add(world, [ground, leftWall, rightWall]);
        score = 0;
        gameOver = false;
        disableAction = false;
        currentFruitBody = null;
        nextFruitType = chooseNextFruit();
        updateNextFruitUI();
        scoreElement.textContent = "0";
        gameOverModal.style.display = "none";
        addCurrentFruit();
        Runner.run(runner, engine);
        clearInterval(gameOverInterval);
        gameOverInterval = setInterval(checkGameOver, 1000);
      }
      restartButton.addEventListener("click", restartGame);

      // Initial game start
      nextFruitType = chooseNextFruit();
      updateNextFruitUI();
      addCurrentFruit();

      // Cleanup
      cleanup = () => {
        clearInterval(gameOverInterval);
        try {
          canvas.removeEventListener("mousemove", mouseMoveHandler);
          canvas.removeEventListener("touchmove", touchMoveHandler);
          canvas.removeEventListener("click", clickHandler);
          canvas.removeEventListener("touchend", touchEndHandler);
          restartButton.removeEventListener("click", restartGame);
          document.body.removeEventListener("click", startAudio);
          document.body.removeEventListener("touchstart", startAudio);
          canvas.removeEventListener("click", startAudio);
          canvas.removeEventListener("touchstart", startAudio);
        } catch {}
        try {
          Render.stop(render);
          Runner.stop(runner);
        } catch {}
      };

      // Resize support
      window.addEventListener("resize", () => {
        const { width, height } = getGameSize();
        canvas.width = width;
        canvas.height = height;
        render.options.width = width;
        render.options.height = height;
      });
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div
      className="game-container"
      style={{
        maxWidth: 500, // was 900
        margin: "0 auto",
        padding: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1>Fruity Fall</h1>
      <div
        className="game-info"
        style={{
          display: "flex",
          justifyContent: "space-around",
          width: "100%",
          marginBottom: 16,
        }}
      >
        <div className="info-box">
          <span>Score</span>
          <div ref={scoreRef} className="value">
            0
          </div>
        </div>
        <div className="info-box">
          <span>Next</span>
          <div ref={nextFruitRef} className="value"></div>
        </div>
      </div>
      <div
        className="canvas-wrapper"
        style={{
          position: "relative",
          border: "12px solid #E1C699",
          borderRadius: 30,
          background: "#F3EAD8",
          maxWidth: 500, // was 900
          width: "100%",
        }}
      >
        <canvas
          ref={canvasRef}
          id="game-canvas"
          style={{ width: "100%", borderRadius: 18, display: "block" }}
        />
        <div
          ref={gameOverModalRef}
          className="game-over-modal"
          style={{
            display: "none",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(93,64,55,0.7)",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            flexDirection: "column",
            borderRadius: 18,
            zIndex: 100,
          }}
        >
          <div
            className="game-over-content"
            style={{
              background: "#FFFBEB",
              padding: 40,
              borderRadius: 25,
              border: "8px solid #E1C699",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              maxWidth: "80%",
            }}
          >
            <div
              className="game-over-title"
              style={{
                fontSize: "3rem",
                fontWeight: 700,
                color: "#EF5350",
                marginBottom: 10,
              }}
            >
              Game Over!
            </div>
            <div
              className="final-score"
              style={{
                fontSize: "1.5rem",
                color: "#7A5548",
                marginBottom: 30,
              }}
            >
              Your Score:{" "}
              <span ref={finalScoreRef} className="value">
                0
              </span>
            </div>
            <button
              ref={restartButtonRef}
              style={{
                backgroundColor: "#FF8A65",
                color: "white",
                border: "none",
                padding: "15px 30px",
                borderRadius: 50,
                fontFamily: "Fredoka, sans-serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background-color 0.3s ease, transform 0.1s ease",
                boxShadow: "0 5px 0px #d86a49",
                borderBottom: "2px solid #b3583b",
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuikaGame;
