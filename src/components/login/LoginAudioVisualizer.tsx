import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Frequency band splitter ── */
const getFrequencyBands = (dataArray: Uint8Array) => {
  const len = dataArray.length;
  const bassEnd = Math.floor(len * 0.15);
  const midEnd = Math.floor(len * 0.55);

  let bass = 0, mid = 0, treble = 0;
  for (let i = 0; i < bassEnd; i++) bass += dataArray[i];
  for (let i = bassEnd; i < midEnd; i++) mid += dataArray[i];
  for (let i = midEnd; i < len; i++) treble += dataArray[i];

  bass /= bassEnd * 255;
  mid /= (midEnd - bassEnd) * 255;
  treble /= (len - midEnd) * 255;

  return { bass, mid, treble };
};

/* ── BPM peak detector ── */
class BPMDetector {
  private history: number[] = [];
  private lastPeak = 0;
  private threshold = 0.4;
  energy = 0;

  update(bass: number, time: number) {
    this.history.push(bass);
    if (this.history.length > 30) this.history.shift();
    const avg = this.history.reduce((a, b) => a + b, 0) / this.history.length;

    if (bass > avg * 1.3 && bass > this.threshold && time - this.lastPeak > 0.15) {
      this.lastPeak = time;
      this.energy = 1;
    }
    this.energy *= 0.85;
    return this.energy;
  }
}

/* ── Particle Wave Mesh ── */
const COLS = 120;
const ROWS = 40;
const COUNT = COLS * ROWS;
const SPREAD_X = 26;
const SPREAD_Z = 12;

interface WaveProps {
  analyserRef: React.RefObject<AnalyserNode | null>;
}

const ParticleWave = ({ analyserRef }: WaveProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dataArray = useMemo(() => new Uint8Array(128), []);
  const bpmDetector = useMemo(() => new BPMDetector(), []);
  const smoothBands = useRef({ bass: 0, mid: 0, treble: 0, bpm: 0 });

  const colorCyan = useMemo(() => new THREE.Color("hsl(190, 100%, 50%)"), []);
  const colorYellow = useMemo(() => new THREE.Color("hsl(50, 100%, 50%)"), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    let bands = { bass: 0, mid: 0, treble: 0 };
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(dataArray);
      bands = getFrequencyBands(dataArray);
    }

    const s = smoothBands.current;
    // Faster lerp = more reactive
    s.bass += (bands.bass - s.bass) * 0.25;
    s.mid += (bands.mid - s.mid) * 0.2;
    s.treble += (bands.treble - s.treble) * 0.22;
    s.bpm = bpmDetector.update(bands.bass, t);

    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const nx = col / (COLS - 1);
      const nz = row / (ROWS - 1);

      const x = (nx - 0.5) * SPREAD_X;
      const z = (nz - 0.5) * SPREAD_Z;

      // Stronger audio-driven waves
      const bassAmp = 0.2 + s.bass * 1.2;
      const midFreq = 3 + s.mid * 3;
      const trebleDetail = 0.06 + s.treble * 0.5;

      const wave1 = Math.sin(nx * midFreq + t * (0.8 + s.mid)) * bassAmp;
      const wave2 = Math.sin(nz * 3 + t * 1.2 + nx * 2) * trebleDetail;
      const wave3 = Math.cos((nx + nz) * 2.5 + t * 0.5) * 0.08;
      const bpmPunch = Math.sin(nx * Math.PI * 3 + t * 6) * s.bpm * 0.8;
      const ripple = Math.sin(Math.sqrt(Math.pow(nx - 0.5, 2) + Math.pow(nz - 0.5, 2)) * 8 - t * 2) * s.bass * 0.3;

      const y = wave1 + wave2 + wave3 + bpmPunch + ripple;

      dummy.position.set(x, y, z);

      // Vertical fade: particles near the "back" (nz=0, top of screen) are smaller
      const verticalFade = 0.3 + nz * 0.7;
      const baseScale = 0.022;
      const energyScale = 1 + s.bass * 0.6 + s.bpm * 1.2;
      dummy.scale.setScalar(baseScale * energyScale * verticalFade);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color shifts: cyan ↔ yellow based on BPM energy
      const bpmMix = Math.min(1, s.bpm * 1.5 + s.bass * 0.3);
      tempColor.copy(colorCyan);
      tempColor.lerp(colorYellow, bpmMix);
      // Vertical fade affects brightness too
      tempColor.multiplyScalar(0.4 + nz * 0.6 + s.bass * 0.3);
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
    </instancedMesh>
  );
};

/* ── Canvas wrapper — full page ── */
const LoginAudioVisualizer = ({ analyserRef }: WaveProps) => {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none">
      {/* Vertical transparency: fades from top (dark) to visible at bottom */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.85) 15%, hsl(var(--background) / 0.3) 45%, transparent 70%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 5.5, 9], fov: 55, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ParticleWave analyserRef={analyserRef} />
      </Canvas>
    </div>
  );
};

export default LoginAudioVisualizer;
