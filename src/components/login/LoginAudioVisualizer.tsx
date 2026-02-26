import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Simple audio energy detector ── */
const getAudioEnergy = (dataArray: Uint8Array) => {
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
  return sum / (dataArray.length * 255);
};

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
  const smoothEnergy = useRef(0);

  const brandColors = useMemo(() => [
    new THREE.Color("hsl(190, 100%, 55%)"),  // Ciano
    new THREE.Color("hsl(320, 100%, 55%)"),  // Magenta
    new THREE.Color("hsl(50, 100%, 55%)"),   // Amarelo
  ], []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempColor2 = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Detect audio energy (0-1)
    let energy = 0;
    if (analyserRef.current) {
      analyserRef.current.getByteFrequencyData(dataArray);
      energy = getAudioEnergy(dataArray);
    }
    // Smooth energy transition
    smoothEnergy.current += (energy - smoothEnergy.current) * 0.15;
    const e = smoothEnergy.current;

    // Speed multiplier: idle = 1x, music playing = up to 3.5x
    const speed = 1 + e * 2.5;

    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const nx = col / (COLS - 1);
      const nz = row / (ROWS - 1);

      const x = (nx - 0.5) * SPREAD_X;
      const z = (nz - 0.5) * SPREAD_Z;

      // Static amplitude waves — only speed changes with music
      const wave1 = Math.sin(nx * 3.5 + t * 0.6 * speed) * 0.3;
      const wave2 = Math.sin(nz * 3 + t * 0.9 * speed + nx * 2) * 0.12;
      const wave3 = Math.cos((nx + nz) * 2.5 + t * 0.4 * speed) * 0.08;

      const y = wave1 + wave2 + wave3;

      dummy.position.set(x, y, z);

      // Vertical fade only — no audio-driven scale
      const verticalFade = 0.3 + nz * 0.7;
      dummy.scale.setScalar(0.022 * verticalFade);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Moving gradient: 3 brand colors — speed also affected by music
      const gradientSpeed = t * (0.3 + e * 0.5);
      const gradientPos = (nx + nz * 0.5 + gradientSpeed) % 3;
      const idx0 = Math.floor(gradientPos) % 3;
      const idx1 = (idx0 + 1) % 3;
      const frac = gradientPos - Math.floor(gradientPos);
      tempColor.copy(brandColors[idx0]);
      tempColor2.copy(brandColors[idx1]);
      tempColor.lerp(tempColor2, frac);
      // Vertical fade brightness
      tempColor.multiplyScalar(0.4 + nz * 0.6);
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
