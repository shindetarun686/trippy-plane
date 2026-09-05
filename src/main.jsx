import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import bgImgUrl from "./assets/mountain-bg.png";

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
  coin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.setValueAtTime(1318.51, t + 0.07); // E6
      gain.gain.setValueAtTime(0.26, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
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

// Draw the bright red open-cockpit plane with toddler pilot
function drawPlane(ctx, p, t) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // Engine glow
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(255, 120, 40, 0.75)";
  ctx.fillStyle = "rgba(255, 150, 50, 0.85)";
  ctx.beginPath();
  ctx.ellipse(-33, 8, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // --- TODDLER PILOT (Visible in Open Cockpit) ---
  // Fluttering scarf trailing behind
  const scarfWave = Math.sin(t * 0.22) * 4;
  ctx.fillStyle = "#ffe066"; // Warm yellow winter scarf
  ctx.beginPath();
  ctx.moveTo(-10, -7);
  ctx.quadraticCurveTo(-22, -9 + scarfWave, -32, -5 + scarfWave * 1.4);
  ctx.lineTo(-30, -1 + scarfWave * 1.4);
  ctx.quadraticCurveTo(-18, -4 + scarfWave, -8, -4);
  ctx.closePath();
  ctx.fill();

  // Pilot Body / Cozy Jacket
  ctx.fillStyle = "#275b9e"; // Cozy navy-blue jacket
  ctx.beginPath();
  ctx.ellipse(3, -5, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Toddler Pilot Round Head
  ctx.fillStyle = "#ffcca3"; // Cute skin tone
  ctx.beginPath();
  ctx.arc(6, -14, 9.5, 0, Math.PI * 2);
  ctx.fill();

  // Rosy toddler cheeks
  ctx.fillStyle = "rgba(255, 105, 120, 0.65)";
  ctx.beginPath();
  ctx.arc(10.5, -11, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2.5, -11, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // Aviator Hat / Cap
  ctx.fillStyle = "#633919"; // Brown leather aviator hat
  ctx.beginPath();
  ctx.arc(5, -16, 9.5, Math.PI * 0.82, Math.PI * 2.18);
  ctx.fill();
  // Hat ear flap
  ctx.beginPath();
  ctx.moveTo(1, -15);
  ctx.lineTo(0, -8.5);
  ctx.lineTo(4.5, -8.5);
  ctx.lineTo(5.5, -14);
  ctx.closePath();
  ctx.fill();

  // Aviator Goggles on Hat
  ctx.fillStyle = "#222222";
  ctx.fillRect(1, -20, 11, 3.5); // Goggle strap
  ctx.fillStyle = "#7de5ff"; // Shiny cyan goggle lenses
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(5.5, -17.5, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(11, -17.5, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big cute toddler eyes
  ctx.fillStyle = "#1e1e2f";
  ctx.beginPath();
  ctx.arc(10, -14, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Eye sparkle
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(10.8, -14.7, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Happy toddler smile
  ctx.strokeStyle = "#b53b3b";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(8.5, -10, 2.5, 0.2, Math.PI * 0.8);
  ctx.stroke();

  // Little toddler hands on flight stick
  ctx.fillStyle = "#ffcca3";
  ctx.beginPath();
  ctx.arc(14, -4, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2c2c2c";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(14, -2);
  ctx.lineTo(16, 3);
  ctx.stroke();

  // --- BRIGHT RED OPEN-ROOF PLANE ---
  // Main Fuselage (Bright Red Gradient)
  const redGrad = ctx.createLinearGradient(0, -14, 0, 16);
  redGrad.addColorStop(0, "#ff404f");
  redGrad.addColorStop(0.45, "#eb1427");
  redGrad.addColorStop(1, "#b30b1c");
  ctx.fillStyle = redGrad;
  ctx.beginPath();
  ctx.ellipse(0, 3, 37, 13.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crisp White Racing Stripe
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(2, 6.5, 30, 2.6, -0.02, 0, Math.PI * 2);
  ctx.fill();

  // OPEN COCKPIT (Roof is open!)
  ctx.fillStyle = "#1a0d1f";
  ctx.beginPath();
  ctx.ellipse(6, -4, 16, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cockpit padded rim
  ctx.strokeStyle = "#fae8d4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(6, -4, 16, 6.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Curved Windshield at front of open cockpit
  ctx.fillStyle = "rgba(200, 245, 255, 0.45)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(16, -4);
  ctx.quadraticCurveTo(19, -12, 14, -16);
  ctx.lineTo(17.5, -16);
  ctx.quadraticCurveTo(22.5, -11, 20.5, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail fin (Bright Red with white stripe)
  ctx.fillStyle = "#db1426";
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(-47, -18);
  ctx.lineTo(-37, -18);
  ctx.lineTo(-20, 2);
  ctx.closePath();
  ctx.fill();
  // Tail white accent
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-41, -12);
  ctx.lineTo(-46, -17);
  ctx.lineTo(-42, -17);
  ctx.lineTo(-37, -12);
  ctx.closePath();
  ctx.fill();

  // Horizontal Tail Stabilizer
  ctx.fillStyle = "#a80b1b";
  ctx.beginPath();
  ctx.moveTo(-28, 4);
  ctx.lineTo(-45, 12);
  ctx.lineTo(-37, 14);
  ctx.lineTo(-22, 6);
  ctx.closePath();
  ctx.fill();

  // Bright Red Wing
  ctx.fillStyle = "#eb1427";
  ctx.beginPath();
  ctx.moveTo(-6, 4);
  ctx.lineTo(8, 28);
  ctx.lineTo(26, 26);
  ctx.lineTo(16, 4);
  ctx.closePath();
  ctx.fill();
  // Wing White Racing Stripe
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0, 11);
  ctx.lineTo(14, 27);
  ctx.lineTo(18, 26);
  ctx.lineTo(4, 11);
  ctx.closePath();
  ctx.fill();

  // Polished Golden Nose Cone
  ctx.fillStyle = "#ffca28";
  ctx.beginPath();
  ctx.moveTo(28, -6);
  ctx.quadraticCurveTo(43, 3, 28, 10);
  ctx.closePath();
  ctx.fill();

  // Spinning Propeller
  const a = t * 0.045;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(41 + Math.cos(a) * 15, 3 - Math.sin(a) * 15);
  ctx.lineTo(41 - Math.cos(a) * 15, 3 + Math.sin(a) * 15);
  ctx.stroke();
  // Propeller Hub
  ctx.fillStyle = "#2c2c2c";
  ctx.beginPath();
  ctx.arc(41, 3, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function GameCanvas({ screen, onStartGame, onOver, onScore, onCoins, best, gameApiRef }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");

    // Load the user's reference mountain background image
    const bgImg = new Image();
    bgImg.src = bgImgUrl;

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
      coins: 0,
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
      s.coins = 0;
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
          x: x - 30,
          y: y + 8,
          vx: rnd(-5.5, -1.8),
          vy: rnd(-2.2, 2.2),
          life: 1,
          col: ["#ffe066", "#ffffff", "#7de5ff"][Math.floor(Math.random() * 3)]
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
          col: ["#a052b6", "#ff404f", "#ffd700", "#ffffff"][Math.floor(Math.random() * 4)]
        });
      }
      onOver(s.score, s.coins);
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
          s.coins = 0;
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

      // Handle screen shake
      ctx.save();
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        shake *= 0.88;
        if (shake < 0.4) shake = 0;
      }

      // --- MOUNTAIN BACKGROUND (User Reference Image with Seamless Scrolling) ---
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        const bgW = (H / bgImg.naturalHeight) * bgImg.naturalWidth;
        const pairW = bgW * 2;
        const offset = ((s.world * 1.5) % pairW + pairW) % pairW;

        for (let x = -offset; x < W + pairW; x += pairW) {
          // Regular orientation
          ctx.drawImage(bgImg, x, 0, bgW, H);
          // Horizontally mirrored orientation for 100% seamless transition
          ctx.save();
          ctx.translate(x + bgW * 2, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(bgImg, 0, 0, bgW, H);
          ctx.restore();
        }
      } else {
        // Crisp mountain sky gradient fallback
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#56b4f7");
        g.addColorStop(0.5, "#93cbe8");
        g.addColorStop(1, "#cbe8f8");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // Soft clouds drifting across top sky
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 6; i++) {
        const cx = (((i * 220 - s.world * 0.3) % (W + 240)) + W + 240) % (W + 240) - 120;
        const cy = 40 + (i % 3) * 50;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.arc(cx + 28, cy - 8, 36, 0, Math.PI * 2);
        ctx.arc(cx + 64, cy, 22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      s.world += 4.2 + Math.min(s.score * 0.025, 3.5);

      if (s.run) {
        // Active gameplay physics
        s.plane.vy = clamp(s.plane.vy + 0.38, -9, 9);
        s.plane.y += s.plane.vy;
        s.plane.angle = clamp(s.plane.vy * 0.055, -0.38, 0.65);

        s.spawn--;
        const gap = Math.max(125, 195 - Math.min(s.score * 1.0, 68));
        const speed = 4.2 + Math.min(s.score * 0.025, 3.5);

        if (s.spawn <= 0) {
          const center = rnd(150, H - 150);
          s.obs.push({
            x: W + 60,
            center,
            gap,
            w: 82,
            passed: false,
            // GOLDEN COIN in between the obstacles
            coin: {
              x: W + 60 + 41,
              y: center,
              collected: false
            }
          });
          s.spawn = Math.max(82, 145 - s.score * 0.45);
        }

        for (const o of s.obs) {
          o.x -= speed;
          if (o.coin) o.coin.x -= speed;
        }

        for (const o of s.obs) {
          // --- ORIGINAL PURPLE GRADIENT MOUNTAIN OBSTACLES (Restored as earlier) ---
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(90, 30, 180, 0.4)";

          const grad = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
          grad.addColorStop(0, "#4c277d");
          grad.addColorStop(0.5, "#a052b6");
          grad.addColorStop(1, "#38205d");
          ctx.fillStyle = grad;

          // Top Mountain Spire (as earlier)
          ctx.beginPath();
          ctx.moveTo(o.x, 0);
          ctx.lineTo(o.x + o.w / 2, o.center - o.gap / 2 - 35);
          ctx.lineTo(o.x + o.w, o.center - o.gap / 2);
          ctx.lineTo(o.x + o.w, 0);
          ctx.closePath();
          ctx.fill();

          // Bottom Mountain Spire (as earlier)
          ctx.beginPath();
          ctx.moveTo(o.x, H);
          ctx.lineTo(o.x + o.w / 2, o.center + o.gap / 2 + 35);
          ctx.lineTo(o.x + o.w, o.center + o.gap / 2);
          ctx.lineTo(o.x + o.w, H);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // --- DRAW GOLDEN COIN IN BETWEEN OBSTACLES ---
          if (o.coin && !o.coin.collected) {
            const spin = Math.cos(s.t * 0.1); // 3D rotating effect
            const coinY = o.coin.y + Math.sin(s.t * 0.08) * 3; // Gentle floating bob

            ctx.save();
            ctx.translate(o.coin.x, coinY);

            // Shimmering Golden Glow
            ctx.shadowBlur = 14;
            ctx.shadowColor = "rgba(255, 215, 0, 0.85)";

            // Outer Golden Coin Body
            ctx.fillStyle = "#ffb300";
            ctx.beginPath();
            ctx.ellipse(0, 0, Math.max(2.5, Math.abs(spin) * 14), 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Inner Bright Gold Face
            if (Math.abs(spin) > 0.25) {
              ctx.fillStyle = "#fff176";
              ctx.beginPath();
              ctx.ellipse(0, 0, Math.max(1.5, (Math.abs(spin) - 0.15) * 11), 11, 0, 0, Math.PI * 2);
              ctx.fill();

              // Star Icon in Coin Center
              ctx.fillStyle = "#f57f17";
              ctx.font = "900 11px system-ui";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("★", 0, 0);
            }

            ctx.restore();

            // Check Coin Collection Collision
            const cdx = s.plane.x - o.coin.x;
            const cdy = s.plane.y - coinY;
            if (Math.hypot(cdx, cdy) < 32) {
              o.coin.collected = true;
              s.coins++;
              sounds.coin();
              onCoins(s.coins);

              // Burst of bright golden coin sparkles
              for (let k = 0; k < 12; k++) {
                s.parts.push({
                  x: o.coin.x,
                  y: coinY,
                  vx: rnd(-4, 4),
                  vy: rnd(-4, 4),
                  life: 1,
                  col: ["#ffe066", "#ffffff", "#ffb300"][Math.floor(Math.random() * 3)]
                });
              }
            }
          }

          // Score Increment on clearing obstacle
          if (!o.passed && o.x + o.w < s.plane.x) {
            o.passed = true;
            s.score++;
            sounds.score();
            onScore(s.score);
          }

          // Obstacle Collision Detection
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
        // Attract mode floating sine wave on title screen
        s.plane.y = H / 2 + Math.sin(s.t * 0.05) * 15;
        s.plane.angle = Math.sin(s.t * 0.05) * 0.08;
      }

      // Particles (thrust sparks & coin bursts)
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

      // Render plane with toddler pilot
      drawPlane(ctx, s.plane, s.t);

      // In-game HUD
      ctx.font = "800 24px system-ui";
      ctx.fillStyle = "rgba(255,255,255,.95)";
      ctx.fillText(`SCORE: ${s.score}`, 28, 45);
      ctx.fillStyle = "#ffd54f";
      ctx.fillText(`🪙 COINS: ${s.coins}`, 200, 45);

      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,.95)";
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
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("trippyBest") || 0));
  const [muted, setMuted] = useState(false);
  const gameApiRef = useRef(null);

  const startGame = () => {
    sounds.init();
    setScore(0);
    setCoins(0);
    setScreen("play");
    setTimeout(() => {
      gameApiRef.current?.start();
    }, 10);
  };

  const toMenu = () => {
    setScreen("menu");
    gameApiRef.current?.toMenu();
  };

  const handleGameOver = (finalScore, finalCoins) => {
    setScore(finalScore);
    setCoins(finalCoins);
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
          onCoins={setCoins}
          best={best}
          gameApiRef={gameApiRef}
        />

        {screen === "menu" && (
          <section
            className="overlay"
            onClick={(e) => {
              if (e.target.tagName !== "BUTTON") startGame();
            }}
          >
            <div className="logo">
              TRIPPY <span>PLANE</span>
            </div>
            <p>Alpine Flight • How long can you survive?</p>
            <div className="plane-icon">✈️</div>
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
            <div className="result" style={{ color: "#ffd54f" }}>
              Coins: <b>🪙 {coins}</b>
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
      <div className="tip">ONE BUTTON. ENDLESS SKY. ✈️</div>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);