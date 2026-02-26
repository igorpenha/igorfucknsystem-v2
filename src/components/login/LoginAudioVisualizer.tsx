import { useRef, useMemo, useCallback } from "react";
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
  private threshold = 0.55;
  energy = 0;

  update(bass: number, time: number) {
    this.history.push(bass);
    if (this.history.length > 30) this.history.shift();
    const avg = this.history.reduce((a, b) => a + b, 0) / this.history.length;

    if (bass > avg * 1.4 && bass > this.threshold && time - this.lastPeak > 0.18) {
      this.lastPeak = time;
      this.energy = 1;
    }
    this.energy *= 0.88;
    return this.energy;
  }
}

/* ── Particle Wave Mesh ── */
const COLS = 80;
const ROWS = 30;
const COUNT = COLS * ROWS;
const SPREAD_X = 12;
const SPREAD_Z = 4;

interface WaveProps {
  analyserRef: React.RefObject<AnalyserNode | null>;
}

const ParticleWave = ({ analyserRef }: WaveProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dataArray = useMemo(() => new Uint8Array(128), []);
  const bpmDetector = useMemo(() => new BPMDetector(), []);
  const smoothBands = useRef({ bass: 0, mid: 0, treble: 0, bpm: 0 });

  // Color palette matching system theme
  const colorPrimary = useMemo(() => new THREE.Color("hsl(190, 100%, 55%)"), []);
  const colorAccent = useMemo(() => new THREE.Color("hsl(320, 100%, 55%)"), []);
  const colorSecondary = useMemo(() => new THREE.Color("hsl(50, 100%, 55%)"), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    let bands = { bass: 0, mid: 0, treble: 0 };
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(dataArray);
      bands = getFrequencyBands(dataArray);
    }

    // Smooth
    const s = smoothBands.current;
    const lerp = 0.18;
    s.bass += (bands.bass - s.bass) * lerp;
    s.mid += (bands.mid - s.mid) * lerp;
    s.treble += (bands.treble - s.treble) * lerp;
    s.bpm = bpmDetector.update(bands.bass, t);

    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const nx = col / (COLS - 1);      // 0..1
      const nz = row / (ROWS - 1);      // 0..1

      const x = (nx - 0.5) * SPREAD_X;
      const z = (nz - 0.5) * SPREAD_Z - 1.5;

      // Wave equation driven by audio
      const waveFreq = 2.5 + s.mid * 4;
      const bassAmp = 0.15 + s.bass * 1.8;
      const trebleDetail = s.treble * 1.2;
      const bpmPunch = s.bpm * 1.5;

      const wave1 = Math.sin(nx * waveFreq + t * (1 + s.mid * 2)) * bassAmp;
      const wave2 = Math.sin(nz * 3 + t * 1.5 + nx * 2) * 0.1 * (1 + trebleDetail);
      const wave3 = Math.cos((nx + nz) * 4 + t * 0.8) * 0.08;
      const bpmWave = Math.sin(nx * Math.PI * 2 + t * 8) * bpmPunch * Math.exp(-Math.abs(nx - 0.5) * 3);

      const y = wave1 + wave2 + wave3 + bpmWave;

      dummy.position.set(x, y, z);

      // Scale particles by energy
      const baseScale = 0.025;
      const energyScale = 1 + s.bass * 0.8 + s.bpm * 2;
      const edgeFade = 1 - Math.pow(Math.abs(nx - 0.5) * 2, 3) * 0.5;
      const scale = baseScale * energyScale * edgeFade;
      dummy.scale.setScalar(scale);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color: bass=accent(pink), mid=primary(cyan), treble=secondary(gold)
      const bassInfluence = Math.max(0, Math.min(1, s.bass * 2));
      const trebleInfluence = Math.max(0, Math.min(1, s.treble * 2));
      tempColor.copy(colorPrimary);
      tempColor.lerp(colorAccent, bassInfluence * 0.6 + s.bpm * 0.4);
      tempColor.lerp(colorSecondary, trebleInfluence * 0.3);
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.85} />
    </instancedMesh>
  );
};

/* ── Canvas wrapper ── */
const LoginAudioVisualizer = ({ analyserRef }: WaveProps) => {
  return (
    <div className="w-full h-32 relative" style={{ marginTop: "-0.5rem" }}>
      {/* Fade edges */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, hsl(var(--background)) 0%, transparent 10%, transparent 90%, hsl(var(--background)) 100%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 2.2, 3.5], fov: 50, near: 0.1, far: 20 }}
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
