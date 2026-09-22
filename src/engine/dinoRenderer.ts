/**
 * DinoRenderer - Authentic Dinosaur (Theropod / T-Rex) Vector Rendering Engine
 * Designed for IAMDinosaur 2027 with anatomical theropod silhouette,
 * articulated jaws, sharp teeth, glowing cyber-eye, dorsal plates,
 * muscular tail sway, and digitigrade running leg cycle.
 */

import { Dino } from '../types/game';

export class DinoRenderer {
  /**
   * Draws an authentic Dinosaur (T-Rex theropod) on 2D / 3D Canvas
   */
  public static drawDinosaur(
    ctx: CanvasRenderingContext2D,
    dino: Dino,
    isLeader: boolean,
    currentSpeed: number = 7,
    scale: number = 1.0
  ): void {
    const x = dino.x;
    const y = dino.y;
    const w = dino.width * scale;
    const h = dino.height * scale;

    ctx.save();

    // Champion Glow
    if (isLeader) {
      ctx.shadowColor = dino.color;
      ctx.shadowBlur = 12 * scale;
    }

    const baseColor = dino.color;
    const outlineColor = isLeader ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
    const eyeColor = isLeader ? '#38bdf8' : '#fbbf24';
    const teethColor = '#f8fafc';
    const armorPlateColor = 'rgba(15, 23, 42, 0.55)';

    ctx.lineWidth = Math.max(1.2, 1.8 * scale);
    ctx.strokeStyle = outlineColor;
    ctx.fillStyle = baseColor;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const time = Date.now() * 0.015 * (currentSpeed / 7);

    if (dino.isDucking) {
      // ==========================================
      // CROUCHING / DUCKING PREDATORY SPRINT POSE
      // ==========================================
      const dw = w * 1.05;
      const dh = h * 0.95;

      // 1. Aerodynamic Thruster Trail / Kinetic Jet
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x - 6 * scale, y + dh * 0.45);
      ctx.lineTo(x - (14 + Math.sin(time * 3) * 4) * scale, y + dh * 0.52);
      ctx.lineTo(x - 6 * scale, y + dh * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = isLeader ? 12 * scale : 0;

      // 2. Low Horizontal T-Rex Body (Belly, Back, Tail)
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      // Start at tail tip
      ctx.moveTo(x - 10 * scale, y + dh * 0.45);
      // Top of tail and back
      ctx.quadraticCurveTo(x + dw * 0.15, y + dh * 0.25, x + dw * 0.45, y + dh * 0.3);
      // Neck leading forward to low head
      ctx.lineTo(x + dw * 0.7, y + dh * 0.28);
      // Top of snout
      ctx.lineTo(x + dw * 0.96, y + dh * 0.32);
      // Snout front tip
      ctx.lineTo(x + dw, y + dh * 0.46);
      // Upper jaw line (open mouth)
      ctx.lineTo(x + dw * 0.78, y + dh * 0.48);
      // Inside mouth corner
      ctx.lineTo(x + dw * 0.75, y + dh * 0.58);
      // Lower jaw front tip
      ctx.lineTo(x + dw * 0.95, y + dh * 0.6);
      // Chin and throat
      ctx.lineTo(x + dw * 0.7, y + dh * 0.68);
      // Chest
      ctx.quadraticCurveTo(x + dw * 0.5, y + dh * 0.75, x + dw * 0.35, y + dh * 0.72);
      // Belly & pelvis
      ctx.lineTo(x + dw * 0.1, y + dh * 0.65);
      // Underside of tail back to tip
      ctx.lineTo(x - 10 * scale, y + dh * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sharp Teeth in open mouth
      ctx.fillStyle = teethColor;
      const teethX = [dw * 0.8, dw * 0.85, dw * 0.9, dw * 0.94];
      for (const tx of teethX) {
        // Upper tooth pointing down
        ctx.beginPath();
        ctx.moveTo(x + tx * scale, y + dh * 0.47);
        ctx.lineTo(x + (tx + 2) * scale, y + dh * 0.53);
        ctx.lineTo(x + (tx + 4) * scale, y + dh * 0.47);
        ctx.fill();
        // Lower tooth pointing up
        ctx.beginPath();
        ctx.moveTo(x + (tx - 1) * scale, y + dh * 0.6);
        ctx.lineTo(x + (tx + 1) * scale, y + dh * 0.55);
        ctx.lineTo(x + (tx + 3) * scale, y + dh * 0.6);
        ctx.fill();
      }

      // Predatory Glowing Eye
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x + dw * 0.74 * scale, y + dh * 0.38, 2.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + (dw * 0.74 - 0.8) * scale, y + (dh * 0.38 - 0.8), 1.6 * scale, 1.6 * scale);

      // Cyber Armor Back Spines
      ctx.fillStyle = armorPlateColor;
      const spinePositions = [0.15, 0.28, 0.42, 0.56];
      for (const sp of spinePositions) {
        ctx.beginPath();
        ctx.moveTo(x + dw * sp * scale, y + dh * 0.28);
        ctx.lineTo(x + (dw * sp + 3) * scale, y + dh * 0.16);
        ctx.lineTo(x + (dw * sp + 6) * scale, y + dh * 0.28);
        ctx.fill();
        ctx.stroke();
      }

      // Crouched Running Legs
      const legCycle = Math.sin(time * 2.2);
      ctx.fillStyle = baseColor;
      // Back leg
      ctx.beginPath();
      ctx.moveTo(x + dw * 0.28 * scale, y + dh * 0.65);
      ctx.lineTo(x + (dw * 0.22 - legCycle * 8) * scale, y + dh * 0.85);
      ctx.lineTo(x + (dw * 0.28 - legCycle * 10) * scale, y + dh);
      ctx.lineTo(x + (dw * 0.38 - legCycle * 10) * scale, y + dh);
      ctx.stroke();

      // Front leg
      ctx.beginPath();
      ctx.moveTo(x + dw * 0.42 * scale, y + dh * 0.65);
      ctx.lineTo(x + (dw * 0.38 + legCycle * 8) * scale, y + dh * 0.85);
      ctx.lineTo(x + (dw * 0.44 + legCycle * 10) * scale, y + dh);
      ctx.lineTo(x + (dw * 0.54 + legCycle * 10) * scale, y + dh);
      ctx.stroke();

      // Forelimb / Tiny Claw in sprint
      ctx.beginPath();
      ctx.moveTo(x + dw * 0.58 * scale, y + dh * 0.62);
      ctx.lineTo(x + dw * 0.66 * scale, y + dh * 0.68);
      ctx.lineTo(x + dw * 0.72 * scale, y + dh * 0.66);
      ctx.stroke();
    } else {
      // ==========================================
      // UPRIGHT THEROPOD DINOSAUR (T-REX) RUN / JUMP
      // ==========================================
      const tailSway = Math.sin(time) * 3 * scale;

      // 1. Long Muscular Theropod Tail
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y + h * 0.55);
      // Curve back down
      ctx.quadraticCurveTo(x + w * 0.05, y + h * 0.58 + tailSway, x - 12 * scale, y + h * 0.62 + tailSway);
      // Tail tip
      ctx.lineTo(x - 14 * scale, y + h * 0.66 + tailSway);
      // Underside of tail back to belly
      ctx.quadraticCurveTo(x + w * 0.08, y + h * 0.72 + tailSway, x + w * 0.26, y + h * 0.75);
      ctx.fill();
      ctx.stroke();

      // Tail Dorsal Spines
      ctx.fillStyle = armorPlateColor;
      const tailSpines = [-8, -2, 4];
      for (const tsp of tailSpines) {
        ctx.beginPath();
        ctx.moveTo(x + tsp * scale, y + h * 0.6 + tailSway);
        ctx.lineTo(x + (tsp + 3) * scale, y + h * 0.52 + tailSway);
        ctx.lineTo(x + (tsp + 6) * scale, y + h * 0.61 + tailSway);
        ctx.fill();
        ctx.stroke();
      }

      // 2. Powerful Torso, Ribcage & Muscular Neck
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      // Back of neck
      ctx.moveTo(x + w * 0.48, y + h * 0.24);
      // Curved theropod spine
      ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.38, x + w * 0.26, y + h * 0.55);
      // Pelvis to belly
      ctx.lineTo(x + w * 0.26, y + h * 0.75);
      // Deep chest curve
      ctx.quadraticCurveTo(x + w * 0.52, y + h * 0.76, x + w * 0.62, y + h * 0.6);
      // Front of neck
      ctx.lineTo(x + w * 0.64, y + h * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Back Armor Ridge Spikes
      ctx.fillStyle = armorPlateColor;
      const backSpines = [
        { sx: 0.28, sy: 0.52 },
        { sx: 0.34, sy: 0.42 },
        { sx: 0.42, sy: 0.32 },
      ];
      for (const bs of backSpines) {
        ctx.beginPath();
        ctx.moveTo(x + w * bs.sx, y + h * bs.sy);
        ctx.lineTo(x + w * bs.sx - 3 * scale, y + h * bs.sy - 5 * scale);
        ctx.lineTo(x + w * bs.sx + 4 * scale, y + h * bs.sy - 2 * scale);
        ctx.fill();
        ctx.stroke();
      }

      // 3. Fierce Theropod Head & Snout (Open Roaring Jaw)
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      // Back of skull
      ctx.moveTo(x + w * 0.46, y + h * 0.26);
      // Top of cranium and supraorbital brow ridge
      ctx.lineTo(x + w * 0.56, y + h * 0.08);
      // Top of muzzle/snout
      ctx.lineTo(x + w * 0.88, y + h * 0.12);
      // Snout front tip
      ctx.lineTo(x + w * 0.94, y + h * 0.22);
      // Upper jawline with teeth
      ctx.lineTo(x + w * 0.68, y + h * 0.24);
      // Gape of mouth (throat inside)
      ctx.lineTo(x + w * 0.64, y + h * 0.34);
      // Lower jaw tip
      ctx.lineTo(x + w * 0.86, y + h * 0.36);
      // Chin and throat connection
      ctx.lineTo(x + w * 0.62, y + h * 0.42);
      ctx.lineTo(x + w * 0.52, y + h * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sharp White Teeth
      ctx.fillStyle = teethColor;
      const upperTeeth = [0.72, 0.77, 0.82, 0.87, 0.91];
      for (const ut of upperTeeth) {
        ctx.beginPath();
        ctx.moveTo(x + w * ut, y + h * 0.23);
        ctx.lineTo(x + w * (ut + 0.02), y + h * 0.29);
        ctx.lineTo(x + w * (ut + 0.04), y + h * 0.23);
        ctx.fill();
      }
      const lowerTeeth = [0.68, 0.74, 0.8, 0.84];
      for (const lt of lowerTeeth) {
        ctx.beginPath();
        ctx.moveTo(x + w * lt, y + h * 0.36);
        ctx.lineTo(x + w * (lt + 0.02), y + h * 0.31);
        ctx.lineTo(x + w * (lt + 0.04), y + h * 0.36);
        ctx.fill();
      }

      // Predatory Glowing Eye & Orbital Ridge
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(x + w * 0.62, y + h * 0.16, 3.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Ocular pupil reflection
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + w * 0.62 - 1 * scale, y + h * 0.16 - 1 * scale, 2 * scale, 2 * scale);

      // Nostril pit on snout
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(x + w * 0.86, y + h * 0.16, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 4. Iconic Small Bipedal Theropod Forelimbs (Arms & Curved Claws)
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      // Shoulder
      ctx.moveTo(x + w * 0.58, y + h * 0.52);
      // Humerus down to elbow
      ctx.lineTo(x + w * 0.68, y + h * 0.58);
      // Forearm forward
      ctx.lineTo(x + w * 0.78, y + h * 0.54);
      ctx.stroke();

      // Two sharp hook claws
      ctx.fillStyle = teethColor;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.78, y + h * 0.53);
      ctx.lineTo(x + w * 0.83, y + h * 0.51);
      ctx.lineTo(x + w * 0.79, y + h * 0.55);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + w * 0.78, y + h * 0.55);
      ctx.lineTo(x + w * 0.83, y + h * 0.57);
      ctx.lineTo(x + w * 0.77, y + h * 0.57);
      ctx.fill();

      // 5. Digitigrade Hind Legs, Muscular Femur & Raptor Talons
      if (dino.isJumping) {
        // Tucked powerful leaping legs
        ctx.fillStyle = baseColor;
        // Upper thigh (femur)
        ctx.beginPath();
        ctx.ellipse(x + w * 0.38, y + h * 0.72, w * 0.16, h * 0.12, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Tucked shin and clawed foot
        ctx.beginPath();
        ctx.moveTo(x + w * 0.38, y + h * 0.78);
        ctx.lineTo(x + w * 0.48, y + h * 0.88);
        ctx.lineTo(x + w * 0.6, y + h * 0.86);
        ctx.stroke();

        // Talons
        ctx.fillStyle = teethColor;
        ctx.fillRect(x + w * 0.6, y + h * 0.84, 4 * scale, 3 * scale);

        // Ion Plasma Jet Thruster from cyber boot
        const thrustGrad = ctx.createLinearGradient(0, y + h * 0.86, 0, y + h + 16 * scale);
        thrustGrad.addColorStop(0, '#38bdf8');
        thrustGrad.addColorStop(0.5, '#0284c7');
        thrustGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = thrustGrad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.42, y + h * 0.88);
        ctx.lineTo(x + w * 0.52, y + h + (14 + Math.sin(time * 4) * 4) * scale);
        ctx.lineTo(x + w * 0.62, y + h * 0.88);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = isLeader ? 12 * scale : 0;
      } else {
        // Running Stride Articulation
        const legStep = Math.sin(time * 2.2);

        // Left Leg (Behind)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + w * 0.28, y + h * 0.68, w * 0.14, h * 0.12); // Shaded hip

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.35, y + h * 0.74);
        // Knee bends back/forth
        ctx.lineTo(x + w * (0.32 - legStep * 0.14), y + h * 0.88);
        // Ankle to Foot
        ctx.lineTo(x + w * (0.38 - legStep * 0.18), y + h);
        ctx.stroke();

        // Left Foot Talons
        ctx.fillStyle = teethColor;
        ctx.fillRect(x + w * (0.38 - legStep * 0.18), y + h - 2 * scale, 6 * scale, 2.5 * scale);

        // Right Leg (Front / Focus)
        ctx.fillStyle = baseColor;
        // Muscular thigh
        ctx.beginPath();
        ctx.ellipse(x + w * 0.42, y + h * 0.72, w * 0.15, h * 0.12, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = outlineColor;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.44, y + h * 0.75);
        // Knee bends inversely
        ctx.lineTo(x + w * (0.42 + legStep * 0.14), y + h * 0.88);
        // Ankle to Foot
        ctx.lineTo(x + w * (0.48 + legStep * 0.18), y + h);
        ctx.stroke();

        // Right Foot Talons (3 Predatory Claws)
        ctx.fillStyle = teethColor;
        const footX = x + w * (0.48 + legStep * 0.18);
        ctx.fillRect(footX, y + h - 2.5 * scale, 7 * scale, 2.5 * scale);
      }
    }

    // Leader Crown / Hologram Badge
    if (isLeader) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${Math.round(9 * scale)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('⚡ ALPHA T-REX #0', x + w * 0.5, y - 8 * scale);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }
}
