"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 120;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      siz[i] = Math.random() * 2.5 + 0.5;
    }
    return [pos, siz];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * 0.12;
    const posAttr = meshRef.current.geometry.getAttribute("position");
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += Math.sin(time + i * 0.3) * 0.003;
      arr[i3] += Math.cos(time + i * 0.2) * 0.002;
    }
    posAttr.needsUpdate = true;
    meshRef.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GlowOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  const orbs = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          -2 - Math.random() * 3,
        ] as [number, number, number],
        color: ["#8b5cf6", "#f472b6", "#22d3ee", "#7c3aed", "#a78bfa"][i],
        scale: 0.4 + Math.random() * 0.6,
        speed: 0.3 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const orb = orbs[i];
      child.position.y =
        orb.position[1] + Math.sin(time * orb.speed + orb.offset) * 0.8;
      child.position.x =
        orb.position[0] + Math.cos(time * orb.speed * 0.7 + orb.offset) * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position} scale={orb.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={orb.color}
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function AmbientCanvas() {
  return (
    <div className="three-canvas-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <FloatingParticles />
        <GlowOrbs />
      </Canvas>
    </div>
  );
}
