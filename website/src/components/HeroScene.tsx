import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Points } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Hero 3D 场景：一层"网络栈"粒子球 + 轨道环 + 线框核心。
 * - 粒子球右移避开中央文字区，缓慢自转 + 跟随鼠标视差
 * - 保留拖拽旋转视角（OrbitControls），不自动旋转
 */
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  // 宽屏把粒子球推到右侧，窄屏回到中央靠右，避免遮挡文字
  const [shift, setShift] = useState(2.0)
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      setShift(w < 720 ? 0.7 : w < 1080 ? 1.3 : 2.0)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const positions = useMemo(() => {
    const count = 2400
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // 球壳 + 少量内部点：r 1.7 ~ 2.9，外层更密
      const r = 1.7 + Math.pow(Math.random(), 1.7) * 1.2
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
      pointsRef.current.rotation.y += delta * 0.08
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        state.pointer.y * 0.16,
        0.05,
      )
      pointsRef.current.rotation.z = THREE.MathUtils.lerp(
        pointsRef.current.rotation.z,
        state.pointer.x * 0.1,
        0.05,
      )
      pointsRef.current.position.x = THREE.MathUtils.lerp(
        pointsRef.current.position.x,
        state.pointer.x * 0.24,
        0.04,
      )
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.14
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.05
      coreRef.current.scale.setScalar(s)
    }
    if (glowRef.current) {
      glowRef.current.position.y = Math.sin(t * 1.2) * 0.26
    }
  })

  return (
    <group position={[shift, 0, 0]}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <pointsMaterial
          size={0.055}
          color="#5eead4"
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <mesh ref={ringRef}>
        <torusGeometry args={[2.35, 0.006, 8, 160]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.3} />
      </mesh>

      <mesh rotation={[Math.PI / 2.4, 0.6, 0]}>
        <torusGeometry args={[2.75, 0.005, 8, 160]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} />
      </mesh>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.3} />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>

      <pointLight intensity={1.1} distance={12} color="#5eead4" />
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 7], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ParticleField />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI - Math.PI / 3.2}
      />
    </Canvas>
  )
}
