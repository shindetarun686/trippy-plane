import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const W = 1100, H = 650;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);

// Lightweight Web Audio sound generator
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }
  flap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(560, t + 0.12);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {}
  }
  score() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.3, t); // D5
      osc.frequency.setValueAtTime(880, t + 0.08); // A5
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    } catch (e) {}
  }
  crash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch (e) {}
  }
}

const sounds = new SoundSystem();

function drawPlane(ctx, p, t) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.shadowBlur = 16;
  ctx.shadowColor = "rgba(80,220,255,.7)";
  // Engine glow
  ctx.fillStyle = "rgba(255,170,70,.85)";
  ctx.beginPath();
  ctx.ellipse(-31, 7, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Tail
  ctx.fillStyle = "#f4f7ff";
  ctx.beginPath();
  ctx.moveTo(-27, 1);
  ctx.lineTo(-47, -13);
  ctx.lineTo(-39, 7);
  ctx.lineTo(-50, 20);
  ctx.lineTo(-25, 13);
  ctx.closePath();
  ctx.fill();
  // Wing
  ctx.fillStyle = "#9edcff";
  ctx.beginPath();
  ctx.moveTo(-4, 3);
  ctx.lineTo(7, 28);
  ctx.lineTo(27, 26);
  ctx.lineTo(15, 3);
  ctx.closePath();
  ctx.fill();
  // Body
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose
  ctx.fillStyle = "#eaf2ff";
  ctx.beginPath();
  ctx.moveTo(26, -8);
  ctx.quadraticCurveTo(43, 0, 26, 8);
  ctx.closePath();
  ctx.fill();
  // Cockpit
  ctx.fillStyle = "#2263b8";
  ctx.beginPath();
  ctx.ellipse(9, -7, 12, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Propeller
  const a = t * 0.04;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(39 + Math.cos(a) * 12, -Math.sin(a) * 12);
  ctx.lineTo(39 - Math.cos(a) * 12, Math.sin(a) * 12);
  ctx.stroke();
  ctx.restore();
}

function GameCanvas({ screen, onStartGame, onOver, onScore, best, gameApiRef }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const r = c.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      ctx.setTransform((dpr * r.width) / W, 0, 0, (dpr * r.height) / H, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let shake = 0;
    const s = {
      plane: { x: 210, y: H / 2, vy: 0, angle: 0 },
      obs: [],
      parts: [],
      score: 0,
      t: 0,
      spawn: 0,
      world: 0,
      run: false
    };
    stateRef.current = s;

    function resetAndFly() {
      s.plane = { x: 210, y: H / 2, vy: -7.5, angle: -0.25 };
      s.obs = [];
      s.parts = [];
      s.score = 0;
      s.t = 0;
      s.spawn = 95; // Initial runway before first obstacle
      s.world = 0;
      s.run = true;
      shake = 0;
      sounds.flap();
      spawnThrustParticles(s.plane.x, s.plane.y);
    }

    function spawnThrustParticles(x, y) {
      for (let i = 0; i < 9; i++) {
        s.parts.push({
          x: x - 28,
          y: y + 7,
          vx: rnd(-5, -1.5),
          vy: rnd(-2.2, 2.2),
          life: 1,
          col: ["#ffe66d", "#ff88dd", "#76dfff"][Math.floor(Math.random() * 3)]
        });
      }
    }

    function flap() {
      if (!s.run) {
        resetAndFly();
        return;
      }
      s.plane.vy = -8.2;
      sounds.flap();
      spawnThrustParticles(s.plane.x, s.plane.y);
    }

    function crash() {
      if (!s.run) return;
      s.run = false;
      shake = 16;
      sounds.crash();
      for (let i = 0; i < 35; i++) {
        s.parts.push({
          x: s.plane.x,
          y: s.plane.y,
          vx: rnd(-6, 6),
          vy: rnd(-6, 6),
          life: 1,
          col: ["#ff4477", "#ffaa33", "#ffffff", "#88eeff"][Math.floor(Math.random() * 4)]
        });
      }
      onOver(s.score);
    }

    // Expose controls to App
    if (gameApiRef) {
      gameApiRef.current = {
        start: () => {
          resetAndFly();
        },
        flap: () => {
          flap();
        },
        toMenu: () => {
          s.run = false;
          s.obs = [];
          s.score = 0;
        }
      };
    }

    function onKeyDown(e) {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (screenRef.current === "menu") {
          onStartGame();
        } else if (screenRef.current === "over") {
          onStartGame();
        } else {
          flap();
        }
      } else if (e.code === "KeyR") {
        if (screenRef.current === "over") {
          onStartGame();
        }
      }
    }

    function onPointerDown(e) {
      if (e.target && (e.target.tagName === "BUTTON" || e.target.closest("button"))) {
        return; // Button handles its own click
      }
      if (screenRef.current === "menu") {
        onStartGame();
      } else if (screenRef.current === "over") {
        onStartGame();
      } else {
        flap();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    c.addEventListener("pointerdown", onPointerDown);

    let raf;
    function loop() {
      s.t++;
      const prog = Math.min(s.score / 100, 1);
      const hue = (s.t * 0.04 + s.score * 1.5) % 360;

      // Handle screen shake
      ctx.save();
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        shake *= 0.88;
        if (shake < 0.4) shake = 0;
      }

      // Sky gradient
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `hsl(${215 + prog * 80}, 75%, ${68 - prog * 8}%)`);
      g.addColorStop(1, `hsl(${275 + prog * 40}, 70%, ${78 - prog * 8}%)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.globalAlpha = 0.28;
      for (let i = 0; i < 7; i++) {
        const x = (((i * 190 - s.world * 0.22) % (W + 220)) + W + 220) % (W + 220) - 110;
        const y = 80 + (i % 3) * 80;
        ctx.fillStyle = `hsl(${(hue + i * 25) % 360}, 100%, 90%)`;
        ctx.beginPath();
        ctx.arc(x, y, 28, 0, 7);
        ctx.arc(x + 30, y - 8, 38, 0, 7);
        ctx.arc(x + 68, y, 24, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Parallax mountains
      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = `hsla(${250 + layer * 35}, 55%, ${42 + layer * 10}%, ${0.2 + layer * 0.12})`;
        const sp = 0.12 + layer * 0.13;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = -80; x < W + 100; x += 100) {
          const xx = x - ((s.world * sp) % 100);
          const pk = 360 - layer * 55 - (x % 300) * 0.12;
          ctx.lineTo(xx, pk);
          ctx.lineTo(xx + 100, 450 - layer * 45);
        }
        ctx.lineTo(W, H);
        ctx.fill();
      }

      s.world += 4.2 + Math.min(s.score * 0.025, 3.5);

      if (s.run) {
        // Active gameplay physics
        s.plane.vy = clamp(s.plane.vy + 0.38, -9, 9);
        s.plane.y += s.plane.vy;
        s.plane.angle = clamp(s.plane.vy * 0.055, -0.38, 0.65);

        s.spawn--;
        const gap = Math.max(120, 190 - Math.min(s.score * 1.0, 70));
        const speed = 4.2 + Math.min(s.score * 0.025, 3.5);

        if (s.spawn <= 0) {
          const center = rnd(145, H - 145);
          s.obs.push({ x: W + 60, center, gap, w: 82, passed: false });
          s.spawn = Math.max(82, 145 - s.score * 0.45);
        }

        for (const o of s.obs) o.x -= speed;

        for (const o of s.obs) {
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(90,30,180,.35)";
          const grad = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
          grad.addColorStop(0, "#4c277d");
          grad.addColorStop(0.5, "#a052b6");
          grad.addColorStop(1, "#38205d");
          ctx.fillStyle = grad;

          // Top obstacle
          ctx.beginPath();
          ctx.moveTo(o.x, 0);
          ctx.lineTo(o.x + o.w / 2, o.center - o.gap / 2 - 35);
          ctx.lineTo(o.x + o.w, o.center - o.gap / 2);
          ctx.lineTo(o.x + o.w, 0);
          ctx.closePath();
          ctx.fill();

          // Bottom obstacle
          ctx.beginPath();
          ctx.moveTo(o.x, H);
          ctx.lineTo(o.x + o.w / 2, o.center + o.gap / 2 + 35);
          ctx.lineTo(o.x + o.w, o.center + o.gap / 2);
          ctx.lineTo(o.x + o.w, H);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Scoring
          if (!o.passed && o.x + o.w < s.plane.x) {
            o.passed = true;
            s.score++;
            sounds.score();
            onScore(s.score);
          }

          // Collision detection
          const px = s.plane.x, py = s.plane.y;
          if (
            px + 26 > o.x &&
            px - 26 < o.x + o.w &&
            (py - 9 < o.center - o.gap / 2 || py + 9 > o.center + o.gap / 2)
          ) {
            crash();
          }
        }

        s.obs = s.obs.filter((o) => o.x > -120);

        // Ceiling & floor collision
        if (s.plane.y < 15 || s.plane.y > H - 15) {
          crash();
        }
      } else if (screenRef.current === "menu") {
        // Attract mode floating sine wave animation on title screen
        s.plane.y = H / 2 + Math.sin(s.t * 0.05) * 15;
        s.plane.angle = Math.sin(s.t * 0.05) * 0.08;
      }

      // Distant birds
      for (let i = 0; i < 4; i++) {
        const x = (((i * 310 - s.world * 0.7) % (W + 100)) + W + 100) % (W + 100);
        const y = 145 + i * 65;
        ctx.strokeStyle = "rgba(255,255,255,.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 7, Math.PI, 0);
        ctx.stroke();
      }

      // Particles
      for (const q of s.parts) {
        q.x += q.vx;
        q.y += q.vy;
        q.vy += 0.04;
        q.life -= 0.025;
        ctx.globalAlpha = Math.max(0, q.life);
        ctx.fillStyle = q.col || "#ffe66d";
        ctx.beginPath();
        ctx.arc(q.x, q.y, 3, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      s.parts = s.parts.filter((q) => q.life > 0);

      // Render plane
      drawPlane(ctx, s.plane, s.t);

      // In-game HUD
      ctx.font = "800 24px system-ui";
      ctx.fillStyle = "rgba(255,255,255,.95)";
      ctx.fillText(`SCORE: ${s.score}`, 28, 45);
      ctx.textAlign = "right";
      ctx.fillText(`BEST: ${Math.max(best, s.score)}`, W - 28, 45);
      ctx.textAlign = "left";

      ctx.restore();
      raf = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      c.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return <canvas ref={canvasRef} aria-label="Trippy Plane game canvas" />;
}

export default function App() {
  const [screen, setScreen] = useState("menu"); // "menu" | "play" | "over"
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("trippyBest") || 0));
  const [muted, setMuted] = useState(false);
  const gameApiRef = useRef(null);

  const startGame = () => {
    sounds.init();
    setScore(0);
    setScreen("play");
    setTimeout(() => {
      gameApiRef.current?.start();
    }, 10);
  };

  const toMenu = () => {
    setScreen("menu");
    gameApiRef.current?.toMenu();
  };

  const handleGameOver = (finalScore) => {
    setScore(finalScore);
    const newBest = Math.max(best, finalScore);
    setBest(newBest);
    localStorage.setItem("trippyBest", newBest.toString());
    setScreen("over");
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    sounds.muted = nextMuted;
  };

  return (
    <main className="app">
      <div className="game-wrap">
        <GameCanvas
          screen={screen}
          onStartGame={startGame}
          onOver={handleGameOver}
          onScore={setScore}
          best={best}
          gameApiRef={gameApiRef}
        />

        {screen === "menu" && (
          <section className="overlay" onClick={(e) => {
            // Click outside button also starts
            if (e.target.tagName !== "BUTTON") startGame();
          }}>
            <div className="logo">
              TRIPPY <span>PLANE</span>
            </div>
            <p>How long can you survive?</p>
            <div className="plane-icon">✈</div>
            <button onClick={startGame}>START GAME</button>
            <small>SPACE / CLICK / TAP TO FLY</small>
          </section>
        )}

        {screen === "over" && (
          <section className="overlay dark">
            <h1>GAME OVER</h1>
            <div className="result">
              Score: <b>{score}</b>
            </div>
            <div className="result">
              Best: <b>{best}</b>
            </div>
            <button onClick={startGame}>PLAY AGAIN</button>
            <button className="secondary" onClick={toMenu}>
              MAIN MENU
            </button>
            <small>PRESS SPACE OR R TO RESTART</small>
          </section>
        )}

        <button
          className="mute"
          onClick={toggleMute}
          title={muted ? "Unmute sound" : "Mute sound"}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
      <div className="tip">ONE BUTTON. ENDLESS SKY. 🌈</div>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);