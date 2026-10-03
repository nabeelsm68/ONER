'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface ExperienceState {
  scrollProgress: number;     // 0 to 1 overall progress
  activeSection: number;      // 0 to 9
  sectionProgress: number;    // 0 to 1 within current section
  pointer: { x: number; y: number; currentX: number; currentY: number };
  reducedMotion: boolean;
}

interface Props {
  stateRef: React.RefObject<ExperienceState>;
}

// ── CAMERA KEYFRAMES (10 Chapters in ONE Continuous World) ───────────
// Carefully tuned cinematography: foreground framing, dramatic parallax, multi-scale reveal
const CAMERA_KEYFRAMES = [
  // 01: Hero — High atmospheric establishing shot overlooking river, valley, industrial complex & distant mountains
  { pos: new THREE.Vector3(180, 115, 230), target: new THREE.Vector3(0, 14, 0) },
  // 02: Environment — Camera descends smoothly toward the facility, framing foreground pines & river canal
  { pos: new THREE.Vector3(95, 48, 135), target: new THREE.Vector3(10, 18, 15) },
  // 03: Problem — Camera glides past pipe racks and distillation columns deep into the process area
  { pos: new THREE.Vector3(38, 22, 78), target: new THREE.Vector3(-12, 14, 0) },
  // 04: Detection — Cinematic close approach to Furnace F-101, framing burners, gas lines & thermal housing
  { pos: new THREE.Vector3(-14, 15, 28), target: new THREE.Vector3(-25, 13, 0) },
  // 05: Explanation — Pivoting around Furnace F-101 revealing causal manifold pipes leading to stacks
  { pos: new THREE.Vector3(-38, 20, 20), target: new THREE.Vector3(-22, 16, -6) },
  // 06: Prediction — Tilts upward along the towering Stack 01 toward the horizon & emission envelope
  { pos: new THREE.Vector3(22, 48, 82), target: new THREE.Vector3(15, 50, -10) },
  // 07: Simulation — Mid-level perspective across the plant focusing on damper actuation & emission trajectory
  { pos: new THREE.Vector3(45, 36, 62), target: new THREE.Vector3(-8, 20, 0) },
  // 08: Action — Focused close-up on physical damper trim actuator and OPC-UA junction
  { pos: new THREE.Vector3(-24, 11, 16), target: new THREE.Vector3(-25, 9.5, 2.5) },
  // 09: Autopilot — Dramatic pull-back ascent revealing the entire site operating in unified automated balance
  { pos: new THREE.Vector3(135, 88, 185), target: new THREE.Vector3(0, 16, 0) },
  // 10: Control Plane — Final high cinematic panoramic overview of the living digital twin
  { pos: new THREE.Vector3(165, 105, 215), target: new THREE.Vector3(0, 18, 0) },
];

export default function ExperienceCanvas({ stateRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Screen-projected 3D telemetry pin positions for DOM overlay
  const [telemetryPositions, setTelemetryPositions] = useState<{ [key: string]: { x: number; y: number; visible: boolean } }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let isTabVisible = true;
    let ambientTime = 0;
    let lastTime = performance.now();

    // ── 1. PROCEDURAL TEXTURE GENERATORS (Zero external network lag) ──
    // 1A. Soft Gaussian Smoke Sprite
    const createSmokeTexture = (): THREE.Texture => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
      grad.addColorStop(0, 'rgba(210, 220, 215, 0.95)');
      grad.addColorStop(0.35, 'rgba(150, 165, 160, 0.6)');
      grad.addColorStop(0.7, 'rgba(95, 110, 105, 0.25)');
      grad.addColorStop(1, 'rgba(40, 50, 48, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(64, 64, 64, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    // 1B. Brushed Industrial Steel Texture
    const createSteelTexture = (): THREE.Texture => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#424c48';
      ctx.fillRect(0, 0, 256, 256);
      // Fine brushed streaks
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, Math.random() * 256, 256, 1 + Math.random() * 2);
      }
      // Structural panel seam lines and rivet marks
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, 248, 248);
      ctx.fillStyle = 'rgba(20,25,22,0.6)';
      for (let x = 16; x < 256; x += 32) {
        ctx.beginPath(); ctx.arc(x, 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, 248, 2, 0, Math.PI * 2); ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      return tex;
    };

    // 1C. Weathered Concrete Texture
    const createConcreteTexture = (): THREE.Texture => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#484f4b';
      ctx.fillRect(0, 0, 256, 256);
      // Micro-aggregate noise
      for (let i = 0; i < 2500; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
      // Expansion joints
      ctx.strokeStyle = 'rgba(25,30,28,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(128, 0); ctx.lineTo(128, 256);
      ctx.moveTo(0, 128); ctx.lineTo(256, 128);
      ctx.stroke();
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      return tex;
    };

    // 1D. Water Normal / Perturbation Texture
    const createWaterNormal = (): THREE.Texture => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#8080ff'; // Flat normal
      ctx.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const nx = Math.sin(x * 0.25) * 20 + Math.cos(y * 0.2) * 15;
          const ny = Math.cos(x * 0.18) * 18 + Math.sin(y * 0.28) * 20;
          ctx.fillStyle = `rgb(${Math.floor(128 + nx)}, ${Math.floor(128 + ny)}, 240)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8);
      return tex;
    };

    // 1E. Cinematic Sky Gradient
    const createSkyTexture = (): THREE.Texture => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      // Realistic atmospheric gradient: Slate-navy zenith -> Cool teal haze -> Warm golden horizon
      grad.addColorStop(0.0, '#0c1514');
      grad.addColorStop(0.35, '#162824');
      grad.addColorStop(0.65, '#283e37');
      grad.addColorStop(0.85, '#4a5b51');
      grad.addColorStop(0.96, '#a89472'); // Warm low-angle sun haze
      grad.addColorStop(1.0, '#695f4c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      // Subtle sun disk glow
      const sunGrad = ctx.createRadialGradient(380, 440, 10, 380, 440, 160);
      sunGrad.addColorStop(0, 'rgba(255, 245, 215, 0.85)');
      sunGrad.addColorStop(0.3, 'rgba(240, 200, 140, 0.35)');
      sunGrad.addColorStop(1, 'rgba(120, 100, 70, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(380, 440, 160, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      return tex;
    };

    const smokeTex = createSmokeTexture();
    const steelTex = createSteelTexture();
    const concreteTex = createConcreteTexture();
    const waterNormalTex = createWaterNormal();
    const skyTex = createSkyTexture();

    // ── 2. THREE.JS RENDERER & SCENE SETUP ───────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.error('WebGL initialization error:', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1714);
    // Exponential atmospheric perspective fog
    scene.fog = new THREE.FogExp2(0x1a2622, 0.0026);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.6, 1600);
    camera.position.copy(CAMERA_KEYFRAMES[0].pos);
    camera.lookAt(CAMERA_KEYFRAMES[0].target);

    const curPos = new THREE.Vector3().copy(CAMERA_KEYFRAMES[0].pos);
    const curTarget = new THREE.Vector3().copy(CAMERA_KEYFRAMES[0].target);

    // ── 3. CINEMATIC SKY DOME ─────────────────────────────────────────
    const skyGeo = new THREE.SphereGeometry(750, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // ── 4. LIGHTING ENVIRONMENT ──────────────────────────────────────
    // 4A. Golden directional sunlight with crisp industrial cast shadows
    const sunLight = new THREE.DirectionalLight(0xfff0dc, 2.7);
    sunLight.position.set(190, 200, 110);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 15;
    sunLight.shadow.camera.far = 700;
    const sDim = 190;
    sunLight.shadow.camera.left = -sDim;
    sunLight.shadow.camera.right = sDim;
    sunLight.shadow.camera.top = sDim;
    sunLight.shadow.camera.bottom = -sDim;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // 4B. Soft atmospheric sky fill
    const hemiLight = new THREE.HemisphereLight(0x7da498, 0x1b2822, 0.95);
    scene.add(hemiLight);

    // 4C. Ambient fill
    const ambLight = new THREE.AmbientLight(0x283830, 0.6);
    scene.add(ambLight);

    // 4D. Localized Furnace Burner & Anomaly Point Light
    const furnaceGlow = new THREE.PointLight(0xf59e0b, 0, 55);
    furnaceGlow.position.set(-25, 14, 0);
    scene.add(furnaceGlow);

    // ── 5. NATURAL LAYERED TERRAIN & SURROUNDING RIDGES ───────────────
    // Primary Topography Mesh: 800x800 with river basin and surrounding mountains
    const terrainGeo = new THREE.PlaneGeometry(800, 800, 128, 128);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const vertexColors: number[] = [];

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      const distFromCenter = Math.sqrt(x * x + z * z);
      // River channel curve
      const riverCenter = Math.sin(z * 0.012) * 60 + 55;
      const distToRiver = Math.abs(x - riverCenter);

      let y = 0;

      if (distToRiver < 42) {
        // Sculpted riverbed gorge
        const rNorm = distToRiver / 42;
        y = -5.5 * Math.cos(rNorm * Math.PI * 0.5);
      } else if (distFromCenter > 85) {
        // Natural rolling ridges & distant mountain foothills
        const oct1 = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 32;
        const oct2 = Math.sin(x * 0.035 + 1.2) * Math.cos(z * 0.032) * 12;
        const outerFactor = Math.min((distFromCenter - 85) / 140, 1);
        y = (oct1 + oct2 + (distFromCenter - 85) * 0.28) * outerFactor;
      } else {
        // Graded industrial pad with subtle 0.2m grading tilt for drainage
        y = (x * 0.005) + 0.2;
      }

      posAttr.setY(i, y);

      // Vertex color blending: silt/wet mud -> gravel pad -> moss/alpine forest
      if (y < -1.5) {
        // Deep moist river silt
        vertexColors.push(0.07, 0.11, 0.09);
      } else if (y < 0.8 && distFromCenter < 90) {
        // Industrial gravel / asphalt pad
        const cG = 0.14 + (Math.random() - 0.5) * 0.02;
        vertexColors.push(0.12, cG, 0.12);
      } else {
        // Natural landscape: deep conifer greens and earthy terrain
        const gVar = 0.17 + Math.sin(x * 0.04 + z * 0.04) * 0.05;
        const rVar = 0.08 + Math.cos(x * 0.03) * 0.02;
        vertexColors.push(rVar, gVar, 0.11);
      }
    }

    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(vertexColors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.06,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // ── 6. DYNAMIC CINEMATIC RIVER & COOLING WATER CANAL ──────────────
    // 6A. Main River Water Plane
    const waterGeo = new THREE.PlaneGeometry(420, 420, 64, 64);
    waterGeo.rotateX(-Math.PI / 2);
    waterGeo.translate(55, -1.3, 0);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x14352e,
      roughness: 0.12,
      metalness: 0.35,
      normalMap: waterNormalTex,
      transparent: true,
      opacity: 0.92,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // 6B. Concrete Cooling Outflow Embankment & Discharge Flume
    const flumeGroup = new THREE.Group();
    flumeGroup.position.set(48, 0, 36);
    scene.add(flumeGroup);

    const flumeWallMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      color: 0x5a635f,
      roughness: 0.88,
      metalness: 0.12,
    });
    const flumeWall = new THREE.Mesh(new THREE.BoxGeometry(8, 6.5, 32), flumeWallMat);
    flumeWall.position.set(0, 1.8, 0);
    flumeWall.castShadow = true;
    flumeWall.receiveShadow = true;
    flumeGroup.add(flumeWall);

    // Heavy Industrial Outflow Pipe Nozzles (Twin 3m conduits)
    const outPipeMat = new THREE.MeshStandardMaterial({
      map: steelTex,
      color: 0x2e3532,
      roughness: 0.45,
      metalness: 0.7,
    });
    for (let p = -1; p <= 1; p += 2) {
      const outPipe = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 9, 20), outPipeMat);
      outPipe.rotateZ(Math.PI / 2);
      outPipe.position.set(3.2, 1.2, p * 7.5);
      outPipe.castShadow = true;
      flumeGroup.add(outPipe);
    }

    // ── 7. INDUSTRIAL COMPLEX (HIGH-FIDELITY ARCHITECTURE) ─────────────
    const facilityGroup = new THREE.Group();
    scene.add(facilityGroup);

    // Shared high-detail PBR materials
    const concretePadMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      color: 0x444d48,
      roughness: 0.88,
      metalness: 0.1,
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      map: steelTex,
      color: 0x242d2a,
      roughness: 0.45,
      metalness: 0.72,
    });
    const lightSteelMat = new THREE.MeshStandardMaterial({
      map: steelTex,
      color: 0x6e7d77,
      roughness: 0.38,
      metalness: 0.78,
    });
    const stackSteelMat = new THREE.MeshStandardMaterial({
      map: steelTex,
      color: 0x4f5a55,
      roughness: 0.52,
      metalness: 0.65,
    });
    const pipeSteelMat = new THREE.MeshStandardMaterial({
      color: 0x36423d,
      roughness: 0.4,
      metalness: 0.75,
    });
    const yellowGasMat = new THREE.MeshStandardMaterial({
      color: 0xd4a528,
      roughness: 0.45,
      metalness: 0.4,
    });
    const redThermalMat = new THREE.MeshStandardMaterial({
      color: 0xb53c30,
      roughness: 0.48,
      metalness: 0.38,
    });
    const structuralTrussMat = new THREE.MeshStandardMaterial({
      color: 0x2a3330,
      roughness: 0.6,
      metalness: 0.7,
      wireframe: false,
    });

    // 7A. Multi-Tier Reinforced Concrete Foundation Pads
    const basePad = new THREE.Mesh(new THREE.BoxGeometry(135, 1.4, 105), concretePadMat);
    basePad.position.set(-6, 0.7, 0);
    basePad.receiveShadow = true;
    facilityGroup.add(basePad);

    const upperProcessPad = new THREE.Mesh(new THREE.BoxGeometry(45, 1.8, 55), concretePadMat);
    upperProcessPad.position.set(12, 1.2, -5);
    upperProcessPad.receiveShadow = true;
    facilityGroup.add(upperProcessPad);

    // 7B. Flue Gas Emission Stacks with Vortex Shedding Strakes & Ring Platforms
    // Stack 01 (Primary Emission Stack): Height 68m, conical taper, 2 maintenance platforms
    const stack1Group = new THREE.Group();
    stack1Group.position.set(15, 0, -10);
    facilityGroup.add(stack1Group);

    const s1Column = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 3.6, 68, 28), stackSteelMat);
    s1Column.position.set(0, 34, 0);
    s1Column.castShadow = true;
    stack1Group.add(s1Column);

    // Helical vortex strakes along the upper 25m of Stack 01
    const strakeGeo = new THREE.TorusGeometry(2.35, 0.16, 8, 24);
    strakeGeo.rotateX(Math.PI / 2);
    for (let st = 0; st < 6; st++) {
      const strake = new THREE.Mesh(strakeGeo, darkSteelMat);
      strake.position.set(0, 48 + st * 3.2, 0);
      stack1Group.add(strake);
    }

    // Stack 01 Maintenance Catwalk Platforms (Elevations 35m & 56m)
    for (const platY of [36, 58]) {
      const platFloor = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.4, 24), darkSteelMat);
      platFloor.position.set(0, platY, 0);
      stack1Group.add(platFloor);
      // Railing ring
      const rail = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.08, 6, 24), lightSteelMat);
      rail.rotateX(Math.PI / 2);
      rail.position.set(0, platY + 1.2, 0);
      stack1Group.add(rail);
    }

    // Stack 01 Top Crown Rim
    const s1Crown = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.45, 12, 28), darkSteelMat);
    s1Crown.rotateX(Math.PI / 2);
    s1Crown.position.set(0, 68, 0);
    stack1Group.add(s1Crown);

    // Secondary Auxiliary Stacks (Stack 02 & Stack 03)
    const stack2Group = new THREE.Group();
    stack2Group.position.set(26, 0, -18);
    facilityGroup.add(stack2Group);
    const s2Column = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 2.9, 54, 20), stackSteelMat);
    s2Column.position.set(0, 27, 0);
    s2Column.castShadow = true;
    stack2Group.add(s2Column);

    const stack3Group = new THREE.Group();
    stack3Group.position.set(6, 0, -24);
    facilityGroup.add(stack3Group);
    const s3Column = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.5, 48, 20), stackSteelMat);
    s3Column.position.set(0, 24, 0);
    s3Column.castShadow = true;
    stack3Group.add(s3Column);

    // 7C. HERO OBJECT: FURNACE F-101 (COMBUSTION PROCESS UNIT)
    const furnaceGroup = new THREE.Group();
    furnaceGroup.position.set(-25, 0, 0);
    facilityGroup.add(furnaceGroup);

    // Heavy Concrete Piers Foundation
    for (let fx = -6; fx <= 6; fx += 12) {
      for (let fz = -4; fz <= 4; fz += 8) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.2, 3.5), concretePadMat);
        pier.position.set(fx, 1.6, fz);
        pier.castShadow = true;
        furnaceGroup.add(pier);
      }
    }

    // Furnace Main Refractory Steel Casing (Elevated 3.2m above ground)
    const fCasing = new THREE.Mesh(new THREE.BoxGeometry(19, 21, 15), darkSteelMat);
    fCasing.position.set(0, 13.5, 0);
    fCasing.castShadow = true;
    fCasing.receiveShadow = true;
    furnaceGroup.add(fCasing);

    // External Vertical Structural I-Beam Stiffeners
    for (let bx = -9.2; bx <= 9.2; bx += 3.06) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 21.4, 0.4), structuralTrussMat);
      beam.position.set(bx, 13.5, 7.6);
      furnaceGroup.add(beam);
      const beamBack = beam.clone();
      beamBack.position.set(bx, 13.5, -7.6);
      furnaceGroup.add(beamBack);
    }

    // Furnace Exterior Inspection Platform & Railing at Elevation 14m
    const fCatwalk = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 18), darkSteelMat);
    fCatwalk.position.set(0, 14, 0);
    furnaceGroup.add(fCatwalk);
    const fRail = new THREE.Mesh(new THREE.BoxGeometry(22.2, 1.3, 18.2), new THREE.MeshBasicMaterial({ color: 0x5a6862, wireframe: true }));
    fRail.position.set(0, 14.8, 0);
    furnaceGroup.add(fRail);

    // Lower Burner Plenum with 4 Fuel-Air Injection Nozzles
    const plenum = new THREE.Mesh(new THREE.BoxGeometry(14, 2.8, 10), darkSteelMat);
    plenum.position.set(0, 4.2, 0);
    furnaceGroup.add(plenum);

    for (let bz = -3; bz <= 3; bz += 2) {
      const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 2.5, 12), lightSteelMat);
      burner.rotateX(Math.PI / 2);
      burner.position.set(0, 4.2, 5.8 + bz * 0.1);
      furnaceGroup.add(burner);
    }

    // Natural Gas Header Manifold (Yellow Pipe System)
    const gasCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, 1.2, 9),
      new THREE.Vector3(-8, 3.8, 9),
      new THREE.Vector3(-2, 4.2, 8.6),
      new THREE.Vector3(4, 4.2, 8.6),
      new THREE.Vector3(10, 2.0, 9),
    ]);
    const gasPipe = new THREE.Mesh(new THREE.TubeGeometry(gasCurve, 24, 0.45, 14, false), yellowGasMat);
    gasPipe.castShadow = true;
    furnaceGroup.add(gasPipe);

    // Actuator & Motorized Damper Unit (Physical control intervention point)
    const damperUnit = new THREE.Group();
    damperUnit.position.set(0, 7.8, 7.8);
    furnaceGroup.add(damperUnit);

    const damperHousing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.8, 2.4), darkSteelMat);
    damperHousing.castShadow = true;
    damperUnit.add(damperHousing);

    // Damper Actuator Position Wheel / Servo Drive (Green Accent)
    const servoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 1.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.35, metalness: 0.85 })
    );
    servoMesh.rotateZ(Math.PI / 2);
    servoMesh.position.set(2.4, 0, 0);
    damperUnit.add(servoMesh);

    // High-Temperature Flue Gas Takeoff Ducting (Red Line to Stack 01)
    const flueDuctCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 24, 0),
      new THREE.Vector3(12, 30, -4),
      new THREE.Vector3(26, 36, -8),
      new THREE.Vector3(40, 34, -10),
    ]);
    const flueDuct = new THREE.Mesh(new THREE.TubeGeometry(flueDuctCurve, 32, 0.75, 16, false), redThermalMat);
    flueDuct.castShadow = true;
    furnaceGroup.add(flueDuct);

    // Subtle thermal anomaly wireframe bounding box on Furnace F-101
    const thermalBoxGeo = new THREE.BoxGeometry(20.5, 22.5, 16.5);
    const thermalBoxMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    });
    const thermalBoundingBox = new THREE.Mesh(thermalBoxGeo, thermalBoxMat);
    thermalBoundingBox.position.set(0, 13.5, 0);
    furnaceGroup.add(thermalBoundingBox);

    // 7D. Distillation Columns & Catalytic Cracker Towers
    const towerGroup = new THREE.Group();
    towerGroup.position.set(2, 0, 16);
    facilityGroup.add(towerGroup);

    // Tower 01: Height 42m with intermediate service rings
    const t1Geo = new THREE.CylinderGeometry(3.6, 3.6, 42, 24);
    const t1Mesh = new THREE.Mesh(t1Geo, lightSteelMat);
    t1Mesh.position.set(0, 21, 0);
    t1Mesh.castShadow = true;
    towerGroup.add(t1Mesh);

    for (let ty = 10; ty < 40; ty += 9) {
      const ringPlat = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.35, 20), darkSteelMat);
      ringPlat.position.set(0, ty, 0);
      towerGroup.add(ringPlat);
    }

    // Tower 02: Height 32m
    const t2Geo = new THREE.CylinderGeometry(2.8, 2.8, 32, 20);
    const t2Mesh = new THREE.Mesh(t2Geo, lightSteelMat);
    t2Mesh.position.set(11, 16, 4);
    t2Mesh.castShadow = true;
    towerGroup.add(t2Mesh);

    // 7E. Storage Tank Farm with Perimeter Containment Bund
    const tankFarmGroup = new THREE.Group();
    tankFarmGroup.position.set(-52, 0, -20);
    facilityGroup.add(tankFarmGroup);

    // Concrete retention wall (Bund dike)
    const bundDike = new THREE.Mesh(new THREE.BoxGeometry(60, 2.2, 45), concretePadMat);
    bundDike.position.set(15, 1.1, 8);
    bundDike.receiveShadow = true;
    tankFarmGroup.add(bundDike);

    // 6 Large Crude & Refined Chemical Storage Tanks
    const tankCylinderGeo = new THREE.CylinderGeometry(7.2, 7.2, 14, 24);
    const tankDomeGeo = new THREE.SphereGeometry(7.22, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.35);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const singleTank = new THREE.Group();
        singleTank.position.set(c * 17.5, 0, r * 17.5);

        const tBody = new THREE.Mesh(tankCylinderGeo, lightSteelMat);
        tBody.position.set(0, 7.5, 0);
        tBody.castShadow = true;
        singleTank.add(tBody);

        const tDome = new THREE.Mesh(tankDomeGeo, darkSteelMat);
        tDome.position.set(0, 14.5, 0);
        singleTank.add(tDome);

        tankFarmGroup.add(singleTank);
      }
    }

    // 7F. Multi-Tier Structural Overhead Pipe Bridges (Trusses)
    const pipeRackGroup = new THREE.Group();
    facilityGroup.add(pipeRackGroup);

    // Structural H-frame support uprights
    const uprightGeo = new THREE.BoxGeometry(0.6, 16, 0.6);
    for (let rx = -35; rx <= 25; rx += 15) {
      const upright1 = new THREE.Mesh(uprightGeo, structuralTrussMat);
      upright1.position.set(rx, 8, 4);
      upright1.castShadow = true;
      pipeRackGroup.add(upright1);

      const upright2 = new THREE.Mesh(uprightGeo, structuralTrussMat);
      upright2.position.set(rx, 8, 10);
      upright2.castShadow = true;
      pipeRackGroup.add(upright2);

      // Horizontal crossbeam
      const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 6.8), structuralTrussMat);
      crossbeam.position.set(rx, 14, 7);
      pipeRackGroup.add(crossbeam);
    }

    // Longitudinal Process Piping Runs (5 Parallel Lines)
    for (let p = 0; p < 5; p++) {
      const pLen = 78;
      const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, pLen, 12), pipeSteelMat);
      pMesh.rotateZ(Math.PI / 2);
      pMesh.position.set(-5, 10 + (p % 3) * 1.8, 5 + Math.floor(p / 3) * 2.5);
      pMesh.castShadow = true;
      pipeRackGroup.add(pMesh);
    }

    // 7G. Electrical Substation & High-Voltage Transformers (Energy Anchor)
    const substationGroup = new THREE.Group();
    substationGroup.position.set(-45, 0, 25);
    facilityGroup.add(substationGroup);

    const transHousing = new THREE.Mesh(new THREE.BoxGeometry(9, 6.5, 7), darkSteelMat);
    transHousing.position.set(0, 3.25, 0);
    transHousing.castShadow = true;
    substationGroup.add(transHousing);

    // Insulator Bushings
    for (let b = -2.5; b <= 2.5; b += 2.5) {
      const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.2, 10), lightSteelMat);
      bushing.position.set(b, 8, 0);
      substationGroup.add(bushing);
    }

    // ── 8. REALISTIC INSTANCED NATURAL VEGETATION & FORESTRY ──────────
    // Multi-tier organic forest framing the industrial plant
    const treeTrunkGeo = new THREE.CylinderGeometry(0.3, 0.6, 4, 6);
    const treeFoliageGeo = new THREE.ConeGeometry(3.2, 8.5, 7);
    treeFoliageGeo.translate(0, 5, 0);

    const coniferMat = new THREE.MeshStandardMaterial({
      color: 0x1b3826,
      roughness: 0.92,
      metalness: 0.04,
      flatShading: true,
    });
    const deciduousMat = new THREE.MeshStandardMaterial({
      color: 0x274a2e,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: true,
    });

    const TREE_COUNT = 320;
    const coniferMesh = new THREE.InstancedMesh(treeFoliageGeo, coniferMat, TREE_COUNT);
    const dummyObj = new THREE.Object3D();

    let placedTrees = 0;
    for (let i = 0; i < 700 && placedTrees < TREE_COUNT; i++) {
      const ang = Math.random() * Math.PI * 2;
      // Clusters along valley perimeter and hills (radius 80 to 260)
      const rad = 82 + Math.pow(Math.random(), 1.4) * 180;
      const tx = Math.cos(ang) * rad;
      const tz = Math.sin(ang) * rad;

      // Keep clearance around river canal and central pad
      const riverCenter = Math.sin(tz * 0.012) * 60 + 55;
      const distToRiver = Math.abs(tx - riverCenter);

      if (distToRiver > 45 && !(Math.abs(tx) < 70 && Math.abs(tz) < 55)) {
        dummyObj.position.set(tx, 0.5, tz);
        const s = 0.65 + Math.random() * 0.85;
        dummyObj.scale.set(s, s * (0.85 + Math.random() * 0.4), s);
        dummyObj.rotation.y = Math.random() * Math.PI * 2;
        dummyObj.updateMatrix();
        coniferMesh.setMatrixAt(placedTrees++, dummyObj.matrix);
      }
    }
    coniferMesh.castShadow = true;
    scene.add(coniferMesh);

    // ── 9. ADVANCED AMBIENT PHENOMENA (CONTINUOUS LIVE WORLD) ───────────
    // 9A. Volumetric Atmospheric Industrial Smoke Plumes (Stack 01 & Stack 02)
    const SMOKE_COUNT = 110;
    const smokeMat = new THREE.SpriteMaterial({
      map: smokeTex,
      color: 0x5a6660,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    interface SmokeParticle {
      sprite: THREE.Sprite;
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      scale: number;
      maxScale: number;
      life: number;
      maxLife: number;
      baseOpacity: number;
    }

    const smokeParticles: SmokeParticle[] = [];
    const smokeGroup = new THREE.Group();
    scene.add(smokeGroup);

    for (let i = 0; i < SMOKE_COUNT; i++) {
      const sp = new THREE.Sprite(smokeMat.clone());
      sp.position.set(15, 68, -10);
      smokeGroup.add(sp);

      smokeParticles.push({
        sprite: sp,
        x: 15,
        y: 68,
        z: -10,
        vx: 0.22 + (Math.random() - 0.5) * 0.12,
        vy: 0.45 + Math.random() * 0.35,
        vz: 0.14 + (Math.random() - 0.5) * 0.12,
        scale: 3.5,
        maxScale: 28 + Math.random() * 14,
        life: Math.random() * 90,
        maxLife: 85 + Math.random() * 35,
        baseOpacity: 0.35 + Math.random() * 0.15,
      });
    }

    // 9B. Thermal Water Discharge Ripples (Cooling Canal Outflow)
    const RIPPLE_COUNT = 5;
    const rippleGeo = new THREE.RingGeometry(1.2, 2.2, 32);
    rippleGeo.rotateX(-Math.PI / 2);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x76b8a8,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ripples: THREE.Mesh[] = [];
    for (let r = 0; r < RIPPLE_COUNT; r++) {
      const rip = new THREE.Mesh(rippleGeo, rippleMat.clone());
      rip.position.set(54, -1.05, 36);
      scene.add(rip);
      ripples.push(rip);
    }

    // 9C. Sunlit Atmospheric Environmental Dust & Moisture Motes
    const DUST_COUNT = 240;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    for (let d = 0; d < DUST_COUNT * 3; d += 3) {
      dustPositions[d] = (Math.random() - 0.5) * 260;
      dustPositions[d + 1] = 2 + Math.random() * 90;
      dustPositions[d + 2] = (Math.random() - 0.5) * 260;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustPoints = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0xffeed2,
        size: 1.6,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(dustPoints);

    // ── 10. 3D SPATIAL TELEMETRY ANCHOR TARGETS ───────────────────────
    const telemetryWorldAnchors = {
      co2: new THREE.Vector3(15, 68, -10),         // Stack 01 Rim
      energy: new THREE.Vector3(-45, 12, 25),       // Substation Grid Bus
      water: new THREE.Vector3(54, 2, 36),          // Cooling Canal Flume
      air: new THREE.Vector3(-85, 10, -50),         // Forest Perimeter
      waste: new THREE.Vector3(-10, 10, -32),       // Process Area
      furnace: new THREE.Vector3(-25, 17, 0),       // Furnace F-101
      damper: new THREE.Vector3(-25, 7.8, 7.8),     // Damper Actuator Point
    };

    const projVec = new THREE.Vector3();
    function getScreenCoords(vec: THREE.Vector3) {
      projVec.copy(vec).project(camera);
      const x = (projVec.x * 0.5 + 0.5) * width;
      const y = (-(projVec.y * 0.5) + 0.5) * height;
      const visible = projVec.z < 1.0;
      return { x, y, visible };
    }

    // ── 11. EVENT LISTENERS & RESIZE ──────────────────────────────────
    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }
    window.addEventListener('resize', handleResize, { passive: true });

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTime = performance.now();
        animId = requestAnimationFrame(renderLoop);
      } else {
        cancelAnimationFrame(animId);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleMouseMove = (e: MouseEvent) => {
      if (!stateRef.current) return;
      stateRef.current.pointer.x = (e.clientX / width - 0.5) * 2;
      stateRef.current.pointer.y = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── 12. CONTINUOUS RAF RENDER LOOP (60fps) ────────────────────────
    function renderLoop(now: number) {
      if (!isTabVisible) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const state = stateRef.current;
      const isReduced = state?.reducedMotion ?? false;

      if (!isReduced) {
        ambientTime += dt;
        if (state) {
          state.pointer.currentX += (state.pointer.x - state.pointer.currentX) * 0.04;
          state.pointer.currentY += (state.pointer.y - state.pointer.currentY) * 0.04;
        }
      }

      const activeSection = state ? state.activeSection : 0;
      const sectionProgress = state ? state.sectionProgress : 0;
      const px = state ? state.pointer.currentX : 0;
      const py = state ? state.pointer.currentY : 0;

      // ── CINEMATIC CAMERA INTERPOLATION ──────────────────────────────
      const targetKF = CAMERA_KEYFRAMES[Math.min(activeSection, CAMERA_KEYFRAMES.length - 1)];
      const nextKF = CAMERA_KEYFRAMES[Math.min(activeSection + 1, CAMERA_KEYFRAMES.length - 1)];

      const blendedTargetPos = new THREE.Vector3().lerpVectors(targetKF.pos, nextKF.pos, sectionProgress * 0.45);
      const blendedLookTarget = new THREE.Vector3().lerpVectors(targetKF.target, nextKF.target, sectionProgress * 0.45);

      // Organic subtle mouse parallax
      blendedTargetPos.x += px * 12;
      blendedTargetPos.y += py * -8;

      const lerpSpeed = isReduced ? 1.0 : 0.045;
      curPos.lerp(blendedTargetPos, lerpSpeed);
      curTarget.lerp(blendedLookTarget, lerpSpeed);

      camera.position.copy(curPos);
      camera.lookAt(curTarget);

      // ── AMBIENT PHYSICS: REALISTIC VOLUMETRIC SMOKE PLUME ────────────
      for (let i = 0; i < SMOKE_COUNT; i++) {
        const p = smokeParticles[i];
        p.life += dt * 32;

        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = 15 + (Math.random() - 0.5) * 1.4;
          p.y = 68;
          p.z = -10 + (Math.random() - 0.5) * 1.4;
          p.scale = 3.5;
        }

        // Upward expansion with wind drift and turbulence
        p.x += p.vx + Math.sin(ambientTime * 0.9 + i) * 0.08;
        p.y += p.vy;
        p.z += p.vz;
        p.scale += dt * 4.2;

        const progress = p.life / p.maxLife;
        // Bell-curve opacity: softly rises then fades into atmosphere
        const alpha = Math.sin(progress * Math.PI) * p.baseOpacity;

        p.sprite.position.set(p.x, p.y, p.z);
        p.sprite.scale.set(p.scale, p.scale, 1);
        (p.sprite.material as THREE.SpriteMaterial).opacity = Math.max(0, alpha);
      }

      // ── AMBIENT PHYSICS: WATER CANAL RIPPLES & SURFACE MOTION ─────────
      waterNormalTex.offset.x = (ambientTime * 0.02) % 1;
      waterNormalTex.offset.y = (ambientTime * 0.015) % 1;

      ripples.forEach((rip, idx) => {
        const rTime = (ambientTime * 0.4 + idx * (1 / RIPPLE_COUNT)) % 1;
        const scale = 1 + rTime * 7;
        rip.scale.set(scale, scale, scale);
        (rip.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - rTime) * 0.65);
      });

      // ── AMBIENT PHYSICS: DUST & ATMOSPHERIC PARTICLES ────────────────
      const dAttr = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let d = 1; d < DUST_COUNT * 3; d += 3) {
        let dy = dAttr.getY(d / 3);
        dy -= 0.09;
        if (dy < 2) dy = 88;
        dAttr.setY(d / 3, dy);
      }
      dustGeo.attributes.position.needsUpdate = true;

      // ── DYNAMIC THERMAL ANOMALY FOCUS (CHAPTERS 4 & 5) ───────────────
      if (activeSection === 3 || activeSection === 4) {
        furnaceGlow.intensity = 3.2 + Math.sin(ambientTime * 5) * 0.8;
        thermalBoundingBox.material.opacity = 0.55 + Math.sin(ambientTime * 4) * 0.25;
      } else {
        furnaceGlow.intensity = Math.max(0, furnaceGlow.intensity - dt * 2.5);
        thermalBoundingBox.material.opacity = Math.max(0, thermalBoundingBox.material.opacity - dt * 2);
      }

      // ── PROJECT PHYSICAL WORLD 3D COORDINATES TO 2D DOM OVERLAYS ────
      const newTelemetryCoords = {
        co2: getScreenCoords(telemetryWorldAnchors.co2),
        energy: getScreenCoords(telemetryWorldAnchors.energy),
        water: getScreenCoords(telemetryWorldAnchors.water),
        air: getScreenCoords(telemetryWorldAnchors.air),
        waste: getScreenCoords(telemetryWorldAnchors.waste),
        furnace: getScreenCoords(telemetryWorldAnchors.furnace),
        damper: getScreenCoords(telemetryWorldAnchors.damper),
      };
      setTelemetryPositions(newTelemetryCoords);

      // Render the Three.js scene
      renderer.render(scene, camera);

      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);

    // ── 13. CLEANUP ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleMouseMove);

      terrainGeo.dispose();
      terrainMat.dispose();
      waterGeo.dispose();
      waterMat.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      coniferMesh.geometry.dispose();
      coniferMat.dispose();
      smokeTex.dispose();
      steelTex.dispose();
      concreteTex.dispose();
      waterNormalTex.dispose();
      skyTex.dispose();
      renderer.dispose();
    };
  }, [stateRef]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10">
      <canvas
        ref={canvasRef}
        id="oner-experience-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* ── 3D-ANCHORED SPATIAL TELEMETRY OVERLAYS ────────────────── */}
      {/* Chapter 02: Pinned physical telemetry pins */}
      {stateRef.current?.activeSection === 1 && (
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-500">
          {/* Stack 01 -> CO2 */}
          {telemetryPositions.co2?.visible && (
            <div
              className="absolute env-bracket-tag"
              style={{
                left: `${telemetryPositions.co2.x}px`,
                top: `${telemetryPositions.co2.y}px`,
                transform: 'translate(20px, -50px)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 exp-font-mono">
                <span>CO₂</span>
                <span className="text-white">412.8 ppm</span>
              </div>
              <div className="text-[9px] text-zinc-400 exp-font-mono">STACK 01 RIM</div>
            </div>
          )}

          {/* Substation -> Energy */}
          {telemetryPositions.energy?.visible && (
            <div
              className="absolute env-bracket-tag"
              style={{
                left: `${telemetryPositions.energy.x}px`,
                top: `${telemetryPositions.energy.y}px`,
                transform: 'translate(-140px, -30px)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 exp-font-mono">
                <span>ENERGY</span>
                <span className="text-white">84.2 MW</span>
              </div>
              <div className="text-[9px] text-zinc-400 exp-font-mono">GRID BUS A</div>
            </div>
          )}

          {/* Cooling Canal Outflow -> Water */}
          {telemetryPositions.water?.visible && (
            <div
              className="absolute env-bracket-tag"
              style={{
                left: `${telemetryPositions.water.x}px`,
                top: `${telemetryPositions.water.y}px`,
                transform: 'translate(20px, -20px)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400 exp-font-mono">
                <span>WATER</span>
                <span className="text-white">1,240 m³/h</span>
              </div>
              <div className="text-[9px] text-zinc-400 exp-font-mono">CANAL INFLOW</div>
            </div>
          )}

          {/* Forest Perimeter -> Air */}
          {telemetryPositions.air?.visible && (
            <div
              className="absolute env-bracket-tag"
              style={{
                left: `${telemetryPositions.air.x}px`,
                top: `${telemetryPositions.air.y}px`,
                transform: 'translate(-120px, -40px)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-lime-400 exp-font-mono">
                <span>AIR</span>
                <span className="text-white">21.4 µg/m³</span>
              </div>
              <div className="text-[9px] text-zinc-400 exp-font-mono">NORTH BUFFER</div>
            </div>
          )}

          {/* Byproduct -> Waste */}
          {telemetryPositions.waste?.visible && (
            <div
              className="absolute env-bracket-tag"
              style={{
                left: `${telemetryPositions.waste.x}px`,
                top: `${telemetryPositions.waste.y}px`,
                transform: 'translate(25px, -20px)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 exp-font-mono">
                <span>WASTE</span>
                <span className="text-white">1.8 t/d</span>
              </div>
              <div className="text-[9px] text-zinc-400 exp-font-mono">BYPRODUCT VOL</div>
            </div>
          )}
        </div>
      )}

      {/* Chapter 04 & 05: Furnace F-101 Spatial Marker */}
      {(stateRef.current?.activeSection === 3 || stateRef.current?.activeSection === 4) && telemetryPositions.furnace?.visible && (
        <div
          className="absolute env-bracket-tag border-amber-500/40 bg-zinc-950/80 transition-opacity duration-300"
          style={{
            left: `${telemetryPositions.furnace.x}px`,
            top: `${telemetryPositions.furnace.y}px`,
            transform: 'translate(30px, -60px)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 exp-font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping mr-0.5" />
            <span>THERMAL ANOMALY</span>
          </div>
          <div className="text-[10px] text-zinc-300 exp-font-mono mt-0.5">FURNACE F-101 CORE · +18.4°C</div>
        </div>
      )}

      {/* Chapter 08: Actuator Damper Spatial Marker */}
      {stateRef.current?.activeSection === 7 && telemetryPositions.damper?.visible && (
        <div
          className="absolute env-bracket-tag border-emerald-500/50 bg-zinc-950/85 transition-opacity duration-300"
          style={{
            left: `${telemetryPositions.damper.x}px`,
            top: `${telemetryPositions.damper.y}px`,
            transform: 'translate(25px, -30px)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 exp-font-mono">
            <span>OPC-UA ACTUATOR</span>
          </div>
          <div className="text-[10px] text-zinc-300 exp-font-mono mt-0.5">DAMPER TRIM · TARGET: 1.042</div>
        </div>
      )}
    </div>
  );
}
