'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
  Stars,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

interface StudioEnvironmentProps {
  children?: React.ReactNode;
  enableOrbit?: boolean;
  cameraPosition?: [number, number, number];
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#F5F5F7" roughness={0.9} metalness={0} />
    </mesh>
  );
}

function BackdropCurve() {
  const shape = new THREE.Shape();
  shape.moveTo(-4, -1.5);
  shape.lineTo(-4, 4);
  shape.bezierCurveTo(-4, 4, -4, -1.5, 0, -1.5);
  shape.bezierCurveTo(4, -1.5, 4, 4, 4, 4);
  shape.lineTo(4, -1.5);
  shape.closePath();

  return (
    <mesh position={[0, 0, -2]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#EAEAEA" roughness={1} metalness={0} />
    </mesh>
  );
}

function DaylightSetup() {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={2.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-5, 5, -3]} intensity={0.8} color="#E8F0FF" />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#FAFAFA" />
      <Environment preset="studio" />
    </>
  );
}

function WarmEditorialSetup() {
  return (
    <>
      <ambientLight intensity={0.4} color="#FFE8D0" />
      <directionalLight
        position={[3, 8, 2]}
        intensity={3}
        color="#FFD4A0"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-4, 4, -2]} intensity={0.6} color="#C0A080" />
      <pointLight position={[2, 3, 2]} intensity={1.2} color="#FFB870" />
      <rectAreaLight
        position={[0, 5, 3]}
        intensity={2}
        color="#FFE0B0"
        width={4}
        height={4}
      />
      <Environment preset="sunset" />
    </>
  );
}

function EveningRunwaySetup() {
  return (
    <>
      <ambientLight intensity={0.15} color="#101020" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[-4, 6, 2]}
        angle={0.4}
        penumbra={0.6}
        intensity={2}
        color="#8080FF"
      />
      <spotLight
        position={[4, 6, 2]}
        angle={0.4}
        penumbra={0.6}
        intensity={2}
        color="#FF8060"
      />
      <rectAreaLight
        position={[0, 4, -3]}
        intensity={3}
        color="#2040A0"
        width={8}
        height={3}
      />
      <Environment preset="night" />
      <Stars radius={30} depth={5} count={300} factor={2} fade />
    </>
  );
}

function CameraController({ preset }: { preset: string }) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const positions: Record<string, [number, number, number]> = {
      full: [0, 1, 4.5],
      upper: [0, 2, 2.5],
      closeup: [0.3, 1.8, 1.2],
    };
    const pos = positions[preset] || positions.full;
    const target = { x: pos[0], y: pos[1], z: pos[2] };
    const start = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      camera.position.set(
        start.x + (target.x - start.x) * ease,
        start.y + (target.y - start.y) * ease,
        start.z + (target.z - start.z) * ease
      );
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [preset, camera]);

  return null;
}

export default function StudioEnvironment({
  children,
  enableOrbit = true,
  cameraPosition = [0, 1, 4.5],
}: StudioEnvironmentProps) {
  const { lightingPreset, cameraPreset } = useStore();

  return (
    <Canvas
      shadows
      dpr={[1, 1.35]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
    >
      <PerspectiveCamera makeDefault position={cameraPosition} fov={45} />
      <CameraController preset={cameraPreset} />

      <Suspense fallback={null}>
        {lightingPreset === 'daylight' && <DaylightSetup />}
        {lightingPreset === 'warm' && <WarmEditorialSetup />}
        {lightingPreset === 'evening' && <EveningRunwaySetup />}

        <GroundPlane />
        <BackdropCurve />

        <ContactShadows
          position={[0, -1.49, 0]}
          opacity={0.4}
          scale={8}
          blur={2.5}
          far={4}
          color={lightingPreset === 'evening' ? '#000020' : '#111111'}
        />

        {children}
      </Suspense>

      {enableOrbit && (
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          minDistance={1.5}
          maxDistance={6}
          makeDefault
        />
      )}
    </Canvas>
  );
}
