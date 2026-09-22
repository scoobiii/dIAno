import { Dino, Obstacle, SprintState } from '../types/game';
import type { GameEngine } from './gameEngine';

// 16 vertices of a 4D unit hypercube
const TESSERACT_VERTICES_4D: [number, number, number, number][] = [];
for (let x = -1; x <= 1; x += 2) {
  for (let y = -1; y <= 1; y += 2) {
    for (let z = -1; z <= 1; z += 2) {
      for (let w = -1; w <= 1; w += 2) {
        TESSERACT_VERTICES_4D.push([x, y, z, w]);
      }
    }
  }
}

// 32 edges of a 4D unit hypercube (pairs of vertex indices differing by exactly 1 coordinate)
const TESSERACT_EDGES_4D: [number, number][] = [];
for (let i = 0; i < TESSERACT_VERTICES_4D.length; i++) {
  for (let j = i + 1; j < TESSERACT_VERTICES_4D.length; j++) {
    const v1 = TESSERACT_VERTICES_4D[i];
    const v2 = TESSERACT_VERTICES_4D[j];
    let diff = 0;
    if (v1[0] !== v2[0]) diff++;
    if (v1[1] !== v2[1]) diff++;
    if (v1[2] !== v2[2]) diff++;
    if (v1[3] !== v2[3]) diff++;
    if (diff === 1) {
      TESSERACT_EDGES_4D.push([i, j]);
    }
  }
}

export class DimensionalRenderer {
  /**
   * Renders the 3D Perspective Track Scene
   */
  public static render3DScene(engine: GameEngine, ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const vx = w * 0.5; // Vanishing point X
    const vy = h * 0.28; // Vanishing point Y
    const groundY = engine.groundY;

    // 1. Skybox with Deep Space & Distant Horizon matching active Epoch
    const epoch = engine.environmentEvolution.currentEpoch;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, vy);
    skyGrad.addColorStop(0, epoch.skyGradients[0]);
    skyGrad.addColorStop(0.5, epoch.skyGradients[1]);
    skyGrad.addColorStop(1, epoch.skyGradients[3]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, vy);

    // Distant Neon Horizon Glow
    ctx.strokeStyle = epoch.horizonGlow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, vy);
    ctx.lineTo(w, vy);
    ctx.stroke();

    // 2. Distant 3D Neon Horizon Monoliths receding to horizon
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#0284c733';
    ctx.lineWidth = 1;
    const monoliths3D = [-280, -160, -60, 60, 160, 280];
    for (const offset of monoliths3D) {
      const px = vx + offset;
      const mh = 32 + Math.abs(offset * 0.08);
      ctx.fillRect(px - 14, vy - mh, 28, mh);
      ctx.strokeRect(px - 14, vy - mh, 28, mh);
    }

    // 3. Ground Track Gradient
    const groundGrad = ctx.createLinearGradient(0, vy, 0, h);
    groundGrad.addColorStop(0, '#0a1024');
    groundGrad.addColorStop(0.5, '#070b18');
    groundGrad.addColorStop(1, '#020617');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, vy, w, h - vy);

    // 4. Perspective 3D Track Lines (Center, Lane Borders, Outer Rails)
    const focalLength = 240;
    const trackWidthAtCamera = w * 0.82;
    const halfW = trackWidthAtCamera * 0.5;

    // Longitudinal Rails radiating from Vanishing Point with Epoch Colors
    const rails = [
      { xOffset: -halfW, color: epoch.railColors.left, glow: epoch.railColors.left, width: 2.5 }, // Outer Left
      { xOffset: -halfW * 0.55, color: epoch.railColors.center, glow: epoch.railColors.center, width: 1.2 }, // Mid Left
      { xOffset: 0, color: epoch.railColors.center, glow: epoch.railColors.center, width: 1.8, dashed: true }, // Center Dash
      { xOffset: halfW * 0.55, color: epoch.railColors.center, glow: epoch.railColors.center, width: 1.2 }, // Mid Right
      { xOffset: halfW, color: epoch.railColors.right, glow: epoch.railColors.right, width: 2.5 }, // Outer Right
    ];

    for (const rail of rails) {
      ctx.save();
      ctx.strokeStyle = rail.color;
      ctx.shadowColor = rail.glow;
      ctx.shadowBlur = 6;
      ctx.lineWidth = rail.width;
      if (rail.dashed) {
        ctx.setLineDash([8, 8]);
      }
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx + rail.xOffset, h);
      ctx.stroke();
      ctx.restore();
    }

    // Horizontal track ties with perspective foreshortening moving with gridOffset
    const scrollZ = (engine.gridOffset * 3.5) % 80;
    for (let z = 80 - scrollZ; z < 900; z += 60) {
      const scale = focalLength / (focalLength + z);
      const tieY = vy + (h - vy) * scale * 1.05;
      if (tieY > vy + 2 && tieY <= h) {
        const tieHalfWidth = halfW * scale;
        const alpha = Math.max(0.08, Math.min(0.65, scale * 1.3));

        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = Math.max(1, scale * 2.4);
        ctx.beginPath();
        ctx.moveTo(vx - tieHalfWidth, tieY);
        ctx.lineTo(vx + tieHalfWidth, tieY);
        ctx.stroke();
      }
    }

    // 5. 3D Obstacles (Sorted from back to front by Depth Z)
    const sortedObstacles = [...engine.obstacles]
      .map((obs) => {
        const dist = obs.x - 60;
        const z = dist * 1.55;
        return { obs, z };
      })
      .filter((item) => item.z >= -40 && item.z <= 1100)
      .sort((a, b) => b.z - a.z);

    for (const item of sortedObstacles) {
      const { obs, z } = item;
      const scale = focalLength / (focalLength + Math.max(1, z));
      const obsW = Math.max(8, obs.width * scale * 1.6);
      const obsH = Math.max(12, obs.height * scale * 1.6);

      // Track center alignment with slight lane variance
      const laneOffset = 0;
      const screenX = vx + laneOffset * scale - obsW * 0.5;
      const groundAtZ = vy + (h - vy) * scale * 1.05;
      const elevation = (groundY - obs.y - obs.height) * scale * 1.2;
      const screenY = groundAtZ - obsH - elevation;

      ctx.save();

      // Drop Shadow on 3D Track
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(screenX + obsW * 0.5, groundAtZ, obsW * 0.65, obsW * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      if (obs.type.startsWith('cactus')) {
        // 3D Neon Crystal Cactus Extrusion
        const extX = (vx - screenX) * 0.12 * scale;
        const extY = (vy - screenY) * 0.12 * scale;

        // Side Face (shaded dark emerald)
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.moveTo(screenX + obsW, screenY);
        ctx.lineTo(screenX + obsW + extX, screenY + extY);
        ctx.lineTo(screenX + obsW + extX, screenY + obsH + extY);
        ctx.lineTo(screenX + obsW, screenY + obsH);
        ctx.closePath();
        ctx.fill();

        // Top Face
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + extX, screenY + extY);
        ctx.lineTo(screenX + obsW + extX, screenY + extY);
        ctx.lineTo(screenX + obsW, screenY);
        ctx.closePath();
        ctx.fill();

        // Front Face (Glowing neon emerald)
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#6ee7b7';
        ctx.lineWidth = Math.max(1, 1.5 * scale);
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8 * scale;
        ctx.fillRect(screenX, screenY, obsW, obsH);
        ctx.strokeRect(screenX, screenY, obsW, obsH);

        // Core energy spine
        ctx.fillStyle = '#d1fae5';
        ctx.fillRect(screenX + obsW * 0.45, screenY + 2, obsW * 0.1, obsH - 4);
      } else if (obs.type.startsWith('pterodactyl')) {
        // 3D Flying Avian Drone
        const wingFlap = Math.sin(Date.now() * 0.015) * (8 * scale);
        ctx.fillStyle = '#be185d';
        ctx.strokeStyle = '#f472b6';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 8 * scale;
        ctx.lineWidth = Math.max(1, 1.5 * scale);

        // Fuselage
        ctx.beginPath();
        ctx.ellipse(screenX + obsW * 0.5, screenY + obsH * 0.5, obsW * 0.45, obsH * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wings
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + obsH * 0.5);
        ctx.lineTo(screenX + obsW * 0.5, screenY + wingFlap);
        ctx.lineTo(screenX + obsW, screenY + obsH * 0.5);
        ctx.stroke();

        // Headlight laser cone projecting onto ground
        const beamGrad = ctx.createLinearGradient(screenX + obsW * 0.5, screenY + obsH * 0.5, screenX + obsW * 0.5, groundAtZ);
        beamGrad.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
        beamGrad.addColorStop(1, 'rgba(236, 72, 153, 0.0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(screenX + obsW * 0.4, screenY + obsH * 0.5);
        ctx.lineTo(screenX - obsW * 0.2, groundAtZ);
        ctx.lineTo(screenX + obsW * 1.2, groundAtZ);
        ctx.lineTo(screenX + obsW * 0.6, screenY + obsH * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (obs.type === 'emp_hazard') {
        // 3D Toroidal EMP Ring
        ctx.strokeStyle = '#c084fc';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10 * scale;
        ctx.lineWidth = Math.max(1.5, 2.5 * scale);

        const pulse = Math.sin(Date.now() * 0.012) * (4 * scale);
        ctx.beginPath();
        ctx.ellipse(screenX + obsW * 0.5, screenY + obsH * 0.5, obsW * 0.5 + pulse, obsH * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Core Spark
        ctx.fillStyle = '#f0abfc';
        ctx.beginPath();
        ctx.arc(screenX + obsW * 0.5, screenY + obsH * 0.5, Math.max(2, 4 * scale), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 6. 3D Dinosaurs (Runner Foreground)
    const runnerZ = 65;
    const runnerScale = focalLength / (focalLength + runnerZ); // ~0.78
    const groundAtRunner = vy + (h - vy) * runnerScale * 1.05;

    // Render non-champion dinos slightly transparent, champion in focus
    const sortedDinos = [...engine.dinos].sort((a, b) => (a.isAlive ? 1 : 0) - (b.isAlive ? 1 : 0));
    for (const dino of sortedDinos) {
      if (!dino.isAlive && engine.mode === 'tri_ai') continue;

      const isLeader = dino === engine.championDino;
      const alpha = isLeader ? 1.0 : 0.35;

      // Lateral distribution across 3D track lanes
      const laneSpread = ((dino.id % 7) - 3) * 22;
      const dinoScreenX = vx + laneSpread * runnerScale;
      const dinoH = (dino.isDucking ? 28 : dino.height) * runnerScale * 1.5;
      const dinoW = dino.width * runnerScale * 1.5;
      const elev = (groundY - dino.y - dino.height) * runnerScale * 1.25;
      const dinoScreenY = groundAtRunner - dinoH - elev;

      ctx.save();
      ctx.globalAlpha = alpha;

      // 3D Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.ellipse(dinoScreenX, groundAtRunner, dinoW * 0.65, dinoW * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Plasma Thruster illumination on 3D ground
      if (dino.isJumping) {
        const thrustGrad = ctx.createRadialGradient(dinoScreenX, groundAtRunner, 2, dinoScreenX, groundAtRunner, 35 * runnerScale);
        thrustGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        thrustGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
        ctx.fillStyle = thrustGrad;
        ctx.beginPath();
        ctx.ellipse(dinoScreenX, groundAtRunner, 35 * runnerScale, 14 * runnerScale, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw 3D Cyber Dino Chassis
      ctx.fillStyle = dino.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, 1.5 * runnerScale);
      if (isLeader) {
        ctx.shadowColor = dino.color;
        ctx.shadowBlur = 10;
      }

      const dx = dinoScreenX - dinoW * 0.5;
      const dy = dinoScreenY;

      // Main Torso
      ctx.fillRect(dx + 6, dy + 8, dinoW - 10, dinoH - 12);
      ctx.strokeRect(dx + 6, dy + 8, dinoW - 10, dinoH - 12);

      // Head & Visor
      ctx.fillRect(dx + 12, dy, dinoW * 0.5, dinoH * 0.35);
      ctx.strokeRect(dx + 12, dy, dinoW * 0.5, dinoH * 0.35);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx + dinoW * 0.35, dy + 4, 6 * runnerScale, 3 * runnerScale);

      // Thrusters
      if (dino.isJumping) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(dx + 8, dy + dinoH - 4);
        ctx.lineTo(dx + dinoW * 0.5, dy + dinoH + 10 * runnerScale);
        ctx.lineTo(dx + dinoW - 8, dy + dinoH - 4);
        ctx.fill();
      }

      if (isLeader) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('LEADER #0', dx - 4, dy - 6);
      }

      ctx.restore();
    }

    // 7. Render Particles in 3D Perspective
    for (const p of engine.particles) {
      ctx.save();
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }

    // 8. 3D Mode Visualizer Watermark
    ctx.save();
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.fillText('3D PERSPECTIVE TRACK // Z-DEPTH FOV 75°', 16, h - 14);
    ctx.restore();
  }

  /**
   * Renders the 4D Tesseract & Spacetime Curvature Scene
   */
  public static render4DScene(engine: GameEngine, ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const groundY = engine.groundY;

    // 1. Spacetime Quantum Vacuum Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#04020a');
    bgGrad.addColorStop(0.5, '#0b051a');
    bgGrad.addColorStop(1, '#110729');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Gravitational Lensing Spacetime Grid (Warped around obstacles)
    this.renderSpacetimeCurvatureGrid(ctx, w, h, groundY, engine.gridOffset, engine.obstacles);

    // 3. Trajectory Guide
    if (engine.championDino && engine.championDino.isAlive) {
      const tactics = engine.optimizerAI.computeOptimalTactics(
        engine.championDino,
        engine.obstacles,
        engine.currentSpeed,
        engine.groundY,
        engine.gravity,
        engine.jumpStrength
      );
      (engine as any).renderTrajectoryGuide(ctx, tactics);
    }

    // 4. Chrono-Ghosts / 4D Worldlines (Temporal Echoes from past frames)
    if (engine.chronoHistory && engine.chronoHistory.length > 3) {
      this.renderChronoGhosts(ctx, engine.chronoHistory);
    }

    // 5. Render Obstacles with 4D Chromatic Shift
    this.render4DObstacles(ctx, engine.obstacles);

    // 6. Render Current Dinos
    (engine as any).renderDinos(ctx);

    // 7. Render Particles
    (engine as any).renderParticles(ctx);

    // 8. Floating 4D Rotating Tesseract (Hypercube Wireframe)
    this.renderTesseract4D(
      ctx,
      w - 85,
      75,
      36,
      engine.tesseractAngleXW,
      engine.tesseractAngleYW,
      engine.tesseractAngleZW
    );

    // 9. Spacetime Telemetry Box in 4D Mode
    this.render4DTelemetry(ctx, engine, w);
  }

  /**
   * Renders Spacetime Curvature Grid lines with Einsteinian gravitational lensing
   */
  private static renderSpacetimeCurvatureGrid(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    groundY: number,
    gridOffset: number,
    obstacles: Obstacle[]
  ): void {
    ctx.save();

    // Compute gravitational distortion for a given (x) coordinate based on nearby obstacles
    const getCurvatureDeltaY = (x: number): number => {
      let delta = 0;
      for (const obs of obstacles) {
        const dx = x - (obs.x + obs.width * 0.5);
        const distSq = dx * dx;
        if (distSq < 18000) {
          const strength = (obs.hazardRating || 3) * 1600;
          delta += strength / (distSq + 900);
        }
      }
      return Math.min(28, delta);
    };

    // Warped Ground Horizon Line
    ctx.strokeStyle = '#c084fc';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= w; x += 16) {
      const warp = getCurvatureDeltaY(x);
      ctx.lineTo(x, groundY + warp);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Curved Vertical Spacetime Geodesic lines
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.lineWidth = 1.2;
    for (let x = -gridOffset; x < w; x += 36) {
      const warp = getCurvatureDeltaY(x);
      ctx.beginPath();
      ctx.moveTo(x, groundY + warp);
      ctx.quadraticCurveTo(x - 12, (groundY + h) * 0.5 + warp * 0.5, x - 26, h);
      ctx.stroke();
    }

    // Warped Horizontal Spacetime lines under ground
    for (let y = groundY + 14; y < h; y += 16) {
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 24) {
        const warp = getCurvatureDeltaY(x) * 0.6;
        ctx.lineTo(x, y + warp);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders Chrono-Ghosts / 4D Temporal Worldlines
   */
  private static renderChronoGhosts(
    ctx: CanvasRenderingContext2D,
    history: { time: number; x: number; y: number; isDucking: boolean; isJumping: boolean; color: string }[]
  ): void {
    ctx.save();

    // 4D Spacetime Worldline connecting temporal points
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let i = 0; i < Math.min(history.length, 18); i++) {
      const pt = history[i];
      if (i === 0) ctx.moveTo(pt.x + 20, pt.y + 20);
      else ctx.lineTo(pt.x + 20, pt.y + 20);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Sample 3 chromatic temporal echoes: t - 4, t - 9, t - 15 frames
    const echoIndices = [
      { idx: 4, color: '#38bdf8', alpha: 0.45, label: 't - 4Δ' }, // Cyan
      { idx: 9, color: '#ec4899', alpha: 0.28, label: 't - 9Δ' }, // Magenta
      { idx: 15, color: '#fbbf24', alpha: 0.16, label: 't - 15Δ' }, // Gold
    ];

    for (const echo of echoIndices) {
      if (echo.idx < history.length) {
        const ghost = history[echo.idx];
        ctx.save();
        ctx.globalAlpha = echo.alpha;
        ctx.fillStyle = echo.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        if (ghost.isDucking) {
          ctx.fillRect(ghost.x, ghost.y + 6, 44, 42);
        } else {
          ctx.fillRect(ghost.x + 10, ghost.y + 14, 28, 22);
          ctx.fillRect(ghost.x + 20, ghost.y, 22, 16);
        }

        ctx.font = '8px monospace';
        ctx.fillStyle = echo.color;
        ctx.fillText(echo.label, ghost.x + 6, ghost.y - 4);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  /**
   * Renders obstacles with 4D chromatic phase aura
   */
  private static render4DObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[]): void {
    for (const obs of obstacles) {
      ctx.save();

      // 4D Quantum Phase Glow Aura
      const auraGrad = ctx.createRadialGradient(
        obs.x + obs.width * 0.5,
        obs.y + obs.height * 0.5,
        4,
        obs.x + obs.width * 0.5,
        obs.y + obs.height * 0.5,
        obs.width * 1.2
      );
      auraGrad.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
      auraGrad.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5, obs.width * 1.2, 0, Math.PI * 2);
      ctx.fill();

      if (obs.type.startsWith('cactus')) {
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#7e22ce';
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        // Chromatic split edge
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(obs.x - 1.5, obs.y - 1.5, obs.width, obs.height);
      } else if (obs.type.startsWith('pterodactyl')) {
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#a21caf';
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;

        const flap = Math.sin(Date.now() * 0.02) * 8;
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5, obs.width * 0.5, obs.height * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height * 0.5);
        ctx.lineTo(obs.x + obs.width * 0.5, obs.y + flap);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height * 0.5);
        ctx.stroke();
      } else {
        // EMP Hazard 4D
        ctx.strokeStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      }

      ctx.restore();
    }
  }

  /**
   * Projects and renders a rotating 4-Dimensional Hypercube (Tesseract) Wireframe
   */
  public static renderTesseract4D(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    angleXW: number,
    angleYW: number,
    angleZW: number
  ): void {
    ctx.save();

    // Background HUD plate for the 4D Tesseract
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1;
    ctx.fillRect(cx - size - 16, cy - size - 16, (size + 16) * 2, (size + 16) * 2 + 14);
    ctx.strokeRect(cx - size - 16, cy - size - 16, (size + 16) * 2, (size + 16) * 2 + 14);

    ctx.font = 'bold 8.5px monospace';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('4D TESSERACT HYPERCUBE', cx - size - 10, cy - size - 4);

    // 4D Rotation Matrices: XW, YW, ZW
    const cosXW = Math.cos(angleXW);
    const sinXW = Math.sin(angleXW);
    const cosYW = Math.cos(angleYW);
    const sinYW = Math.sin(angleYW);
    const cosZW = Math.cos(angleZW);
    const sinZW = Math.sin(angleZW);

    const projected2D: [number, number][] = [];

    // Project each of the 16 4D vertices to 3D and then 2D
    for (const [x0, y0, z0, w0] of TESSERACT_VERTICES_4D) {
      // Rotation in XW plane
      const x1 = x0 * cosXW - w0 * sinXW;
      const w1 = x0 * sinXW + w0 * cosXW;

      // Rotation in YW plane
      const y2 = y0 * cosYW - w1 * sinYW;
      const w2 = y0 * sinYW + w1 * cosYW;

      // Rotation in ZW plane
      const z3 = z0 * cosZW - w2 * sinZW;
      const w3 = z0 * sinZW + w2 * cosZW;

      // Stereographic 4D -> 3D Projection (distance camera = 2.4)
      const distance4D = 2.4;
      const factor4D = 1 / (distance4D - w3);
      const x3D = x1 * factor4D;
      const y3D = y2 * factor4D;
      const z3D = z3 * factor4D;

      // Perspective 3D -> 2D Canvas coordinates
      const distance3D = 3.0;
      const factor3D = 1 / (distance3D - z3D);
      const px = cx + x3D * factor3D * size * 2.8;
      const py = cy + y3D * factor3D * size * 2.8;

      projected2D.push([px, py]);
    }

    // Render 32 Tesseract Edges
    ctx.lineWidth = 1.2;
    for (const [i, j] of TESSERACT_EDGES_4D) {
      const [x1, y1] = projected2D[i];
      const [x2, y2] = projected2D[j];

      // Inner cube vs outer hyper-connections styling
      const isCrossEdge = TESSERACT_VERTICES_4D[i][3] !== TESSERACT_VERTICES_4D[j][3];
      ctx.strokeStyle = isCrossEdge ? 'rgba(236, 72, 153, 0.7)' : 'rgba(56, 189, 248, 0.85)';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Render 16 Vertex Nodes
    for (let i = 0; i < projected2D.length; i++) {
      const [px, py] = projected2D[i];
      const wCoord = TESSERACT_VERTICES_4D[i][3];
      ctx.fillStyle = wCoord > 0 ? '#38bdf8' : '#a855f7';
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sub-caption
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText(`PHASE θ: ${(angleXW % Math.PI).toFixed(2)} rad`, cx - size - 10, cy + size + 9);

    ctx.restore();
  }

  /**
   * Telemetry HUD details specific to 4D Mode
   */
  private static render4DTelemetry(ctx: CanvasRenderingContext2D, engine: GameEngine, w: number): void {
    ctx.save();
    ctx.font = 'bold 9.5px monospace';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('4D SPACETIME CONTINUUM // MINKOWSKI METRIC η = diag(-1, 1, 1, 1)', 16, engine.height - 14);

    const speedRatio = Math.min(0.95, engine.currentSpeed / 20);
    const gamma = 1 / Math.sqrt(1 - speedRatio * speedRatio);
    ctx.fillStyle = '#f0abfc';
    ctx.fillText(`CHRONO-DILATION FACTOR γ: ${gamma.toFixed(3)}x`, 16, engine.height - 28);
    ctx.restore();
  }

  /**
   * Renders the Automated Difficulty Sprint HUD Bar & Pill
   */
  public static renderSprintHUD(ctx: CanvasRenderingContext2D, sprintState: SprintState, w: number, h: number): void {
    const current = sprintState.currentSprint;
    const progress = sprintState.sprintScoreProgress;
    const target = current.targetScore;
    const pct = Math.min(100, Math.round((progress / (target || 1)) * 100));

    ctx.save();

    // Top-Center Sprint Dashboard Pill
    const pillW = 280;
    const pillH = 34;
    const pillX = (w - pillW) * 0.5;
    const pillY = 8;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = current.badgeColor;
    ctx.lineWidth = 1.2;
    ctx.fillRect(pillX, pillY, pillW, pillH);
    ctx.strokeRect(pillX, pillY, pillW, pillH);

    // Title & Tier
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = current.badgeColor;
    ctx.fillText(current.title.toUpperCase(), pillX + 10, pillY + 14);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8.5px monospace';
    ctx.fillText(`TIER ${current.threatTier} | ${current.minSpeed.toFixed(1)}-${current.maxSpeed.toFixed(1)} px/f`, pillX + 10, pillY + 26);

    // Percentage & Target
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'right';
    ctx.fillText(`${pct}%`, pillX + pillW - 10, pillY + 14);

    ctx.fillStyle = '#64748b';
    ctx.font = '8px monospace';
    ctx.fillText(`${progress}/${target} pts`, pillX + pillW - 10, pillY + 26);
    ctx.textAlign = 'left';

    // Progress line at bottom of pill
    const barW = pillW - 20;
    const fillW = (barW * pct) / 100;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fillRect(pillX + 10, pillY + pillH - 4, barW, 2.5);

    ctx.fillStyle = current.badgeColor;
    ctx.shadowColor = current.badgeColor;
    ctx.shadowBlur = 4;
    ctx.fillRect(pillX + 10, pillY + pillH - 4, fillW, 2.5);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  /**
   * Renders the Pop-up Banner Notification on Sprint Completion or Mode Change
   */
  public static renderSprintBanner(
    ctx: CanvasRenderingContext2D,
    banner: SprintState['bannerNotification'],
    w: number,
    h: number
  ): void {
    if (!banner) return;

    const age = Date.now() - banner.timestamp;
    if (age > banner.duration) return;

    const fadeIn = Math.min(1, age / 250);
    const fadeOut = Math.max(0, (banner.duration - age) / 400);
    const alpha = Math.min(fadeIn, fadeOut);

    ctx.save();
    ctx.globalAlpha = alpha;

    const boxW = Math.min(540, w - 40);
    const boxH = 58;
    const boxX = (w - boxW) * 0.5;
    const boxY = h * 0.28;

    // Glowing Banner Container
    ctx.fillStyle = 'rgba(6, 10, 18, 0.94)';
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 1.8;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Main Header
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(banner.message, w * 0.5, boxY + 24);

    // Submessage
    ctx.font = '10.5px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(banner.submessage, w * 0.5, boxY + 44);

    ctx.restore();
  }
}
