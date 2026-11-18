'use client';

import React from 'react';

interface GarmentDetailsProps {
  topProductId?: string;
  bottomProductId?: string;
  topColor: string;
  bottomColor: string;
}

function ShirtDetails({ color, buttons = 5 }: { color: string; buttons?: number }) {
  return (
    <group>
      <mesh position={[0, 1.18, 0.207]}>
        <boxGeometry args={[0.016, 0.38, 0.012]} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>
      {Array.from({ length: buttons }, (_, index) => (
        <mesh key={index} position={[0, 1.34 - index * 0.065, 0.217]}>
          <sphereGeometry args={[0.009, 8, 8]} />
          <meshStandardMaterial color="#E8E1D4" roughness={0.38} />
        </mesh>
      ))}
      <mesh position={[-0.043, 1.48, 0.205]} rotation={[0, 0, -0.22]}>
        <boxGeometry args={[0.065, 0.12, 0.018]} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>
      <mesh position={[0.043, 1.48, 0.205]} rotation={[0, 0, 0.22]}>
        <boxGeometry args={[0.065, 0.12, 0.018]} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>
    </group>
  );
}

function HoodieDetails({ color, zipUp = false }: { color: string; zipUp?: boolean }) {
  return (
    <group>
      <mesh position={[0, 1.59, -0.055]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.12, 0.032, 8, 24, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.94} />
      </mesh>
      {zipUp ? (
        <>
          <mesh position={[0, 1.17, 0.215]}>
            <boxGeometry args={[0.012, 0.48, 0.012]} />
            <meshStandardMaterial color="#C8C8C8" metalness={0.65} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.48, 0.213]}>
            <boxGeometry args={[0.19, 0.06, 0.025]} />
            <meshStandardMaterial color={color} roughness={0.92} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.96, 0.209]}>
            <boxGeometry args={[0.2, 0.15, 0.022]} />
            <meshStandardMaterial color={color} roughness={0.94} />
          </mesh>
          <mesh position={[-0.035, 1.4, 0.211]}>
            <cylinderGeometry args={[0.004, 0.004, 0.19, 6]} />
            <meshStandardMaterial color="#D8D2C7" roughness={0.75} />
          </mesh>
          <mesh position={[0.035, 1.4, 0.211]}>
            <cylinderGeometry args={[0.004, 0.004, 0.19, 6]} />
            <meshStandardMaterial color="#D8D2C7" roughness={0.75} />
          </mesh>
        </>
      )}
      <mesh position={[0, 0.72, 0.19]}>
        <boxGeometry args={[0.29, 0.055, 0.025]} />
        <meshStandardMaterial color={color} roughness={0.94} />
      </mesh>
    </group>
  );
}

function BlazerDetails({ color, moto = false }: { color: string; moto?: boolean }) {
  return (
    <group>
      <mesh position={[-0.055, 1.39, 0.211]} rotation={[0, 0, -0.24]}>
        <boxGeometry args={[0.075, 0.3, 0.024]} />
        <meshStandardMaterial color={color} roughness={moto ? 0.48 : 0.82} />
      </mesh>
      <mesh position={[0.055, 1.39, 0.211]} rotation={[0, 0, 0.24]}>
        <boxGeometry args={[0.075, 0.3, 0.024]} />
        <meshStandardMaterial color={color} roughness={moto ? 0.48 : 0.82} />
      </mesh>
      <mesh
        position={[moto ? 0.035 : 0, 1.14, 0.22]}
        rotation={[0, 0, moto ? -0.12 : 0]}
      >
        <boxGeometry args={[0.012, 0.43, 0.012]} />
        <meshStandardMaterial
          color={moto ? '#C6A46A' : '#D0C8B9'}
          metalness={0.62}
          roughness={0.32}
        />
      </mesh>
      {!moto && (
        <mesh position={[0.1, 1.08, 0.21]}>
          <boxGeometry args={[0.11, 0.045, 0.022]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>
      )}
    </group>
  );
}

function TeeDetails({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 1.54, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.085, 0.014, 8, 24]} />
        <meshStandardMaterial color="#F1EDE5" roughness={0.8} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.34, 1.36, 0.025]} rotation={[0, 0, side * 0.22]}>
          <boxGeometry args={[0.095, 0.035, 0.16]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function TurtleneckDetails({ color }: { color: string }) {
  return (
    <mesh position={[0, 1.51, 0.015]}>
      <cylinderGeometry args={[0.095, 0.11, 0.16, 20, 1, true]} />
      <meshStandardMaterial color={color} roughness={0.9} side={2} />
    </mesh>
  );
}

function TrouserDetails({ productId, color }: { productId: string; color: string }) {
  return (
    <group>
      <mesh position={[0, 1.035, 0.14]}>
        <boxGeometry args={[0.31, 0.035, 0.025]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
      {productId === 'pants-003' ? (
        [-1, 1].map((side) => (
          <group key={side} position={[side * 0.15, 0.57, 0.145]}>
            <mesh>
              <boxGeometry args={[0.105, 0.15, 0.035]} />
              <meshStandardMaterial color={color} roughness={0.82} />
            </mesh>
            <mesh position={[0, 0.05, 0.02]}>
              <boxGeometry args={[0.105, 0.025, 0.012]} />
              <meshStandardMaterial color={color} roughness={0.82} />
            </mesh>
          </group>
        ))
      ) : (
        <>
          <mesh position={[0, 0.83, 0.148]}>
            <boxGeometry args={[0.008, 0.19, 0.01]} />
            <meshStandardMaterial color="#AAA49A" roughness={0.78} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.12, 0.82, 0.145]} rotation={[0, 0, side * 0.18]}>
              <boxGeometry args={[0.008, 0.35, 0.008]} />
              <meshStandardMaterial color={color} roughness={0.86} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

export default function GarmentDetails({
  topProductId,
  bottomProductId,
  topColor,
  bottomColor,
}: GarmentDetailsProps) {
  let topDetails: React.ReactNode = null;

  switch (topProductId) {
    case 'top-ringer-tee':
      topDetails = <TeeDetails color={topColor} />;
      break;
    case 'top-002':
      topDetails = <TurtleneckDetails color={topColor} />;
      break;
    case 'hoodie-grey':
    case 'hoodie-001':
      topDetails = <HoodieDetails color={topColor} />;
      break;
    case 'hoodie-002':
      topDetails = <HoodieDetails color={topColor} zipUp />;
      break;
    case 'jacket-001':
      topDetails = <BlazerDetails color={topColor} />;
      break;
    case 'jacket-002':
      topDetails = <HoodieDetails color={topColor} zipUp />;
      break;
    case 'jacket-003':
      topDetails = <BlazerDetails color={topColor} moto />;
      break;
    case 'top-linen-shirt':
    case 'top-001':
    case 'top-003':
      topDetails = <ShirtDetails color={topColor} buttons={topProductId === 'top-001' ? 6 : 5} />;
      break;
  }

  return (
    <group name="procedural-garment-details">
      {topDetails}
      {bottomProductId && <TrouserDetails productId={bottomProductId} color={bottomColor} />}
    </group>
  );
}
