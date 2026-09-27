import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Points } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Hero 3D 场景：一层"网络栈"粒子球 + 轨道环 + 线框核心。
 * - 粒子球自动缓旋，跟随鼠标指针做视差偏斜
 * - 用户可直接拖拽旋转视角（OrbitControls）
 */
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const positions = useMemo(() => {
    const count = 6000
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // 球壳 + 少量内部点：r 2.0 ~ 3.5，外层更密
      const r = 2.0 + Math.pow(Math.random(), 1.7) * 1.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.12
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        state.pointer.y * 0.3,
        0.06,
      )
      pointsRef.current.rotation.z = THREE.MathUtils.lerp(
        pointsRef.current.rotation.z,
        state.pointer.x * 0.16,
        0.06,
      )
      pointsRef.current.position.x = THREE.MathUtils.lerp(
        pointsRef.current.position.x,
        state.pointer.x * 0.4,
        0.05,
      )
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.2
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.05
      coreRef.current.scale.setScalar(s)
    }
    if (glowRef.current) {
      glowRef.current.position.y = Math.sin(t * 1.2) * 0.3
    }
  })

  return (
    <group>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <pointsMaterial
          size={0.09}
          color="#5eead4"
          transparent
          opacity={0.82}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <mesh ref={ringRef}>
        <torusGeometry args={[2.7, 0.006, 8, 160]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.32} />
      </mesh>

      <mesh rotation={[Math.PI / 2.4, 0.6, 0]}>
        <torusGeometry args={[3.1, 0.005, 8, 160]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} />
      </mesh>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.32} />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>

      <pointLight intensity={1.2} distance={12} color="#5eead4" />
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 7], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ParticleField />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.9}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI - Math.PI / 3.4}
      />
    </Canvas>
  )
}
