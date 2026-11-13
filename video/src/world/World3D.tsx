import { useThree } from '@react-three/fiber'
import { ThreeCanvas } from '@remotion/three'
import { useLayoutEffect, useMemo } from 'react'
import { AbsoluteFill, cancelRender, useVideoConfig } from 'remotion'
import type * as THREE from 'three'
import { AIFlowNetwork } from './AIFlowNetwork'
import { backdropTexture } from './backdrop'
import { applyPose, type Pose } from './camera'
import { worldAt } from './director'
import { Prism3D } from './Prism3D'

function CameraRig({ pose }: { pose: Pose }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useLayoutEffect(() => {
    applyPose(camera, pose)
  }, [camera, pose])
  return null
}

/**
 * Paints the shared backdrop into the WebGL background (so the glass refracts
 * the stage) and guards the render: a lost context or a shader that fails to
 * link stops the render loudly instead of producing frames without the world.
 */
function Stage() {
  const scene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl)
  useLayoutEffect(() => {
    scene.background = backdropTexture()
    gl.setClearColor('#0b1226', 1)
    // the glass refraction buffer does not need full 4K resolution
    ;(gl as unknown as { transmissionResolutionScale?: number }).transmissionResolutionScale = 0.5
    gl.debug.onShaderError = (_ctx, _program, vs, fs) => {
      cancelRender(new Error(`WebGL program failed to link (vs ${vs ? 'ok' : '?'}, fs ${fs ? 'ok' : '?'})`))
    }
    const canvas = gl.domElement
    const onLost = (e: Event) => {
      e.preventDefault()
      cancelRender(new Error('WebGL context lost'))
    }
    canvas.addEventListener('webglcontextlost', onLost)
    return () => canvas.removeEventListener('webglcontextlost', onLost)
  }, [scene, gl])
  return null
}

/**
 * The persistent 3D world — one stage for the network, the recurring request
 * and the prism. `t` is film time in seconds.
 */
export function World3D({ t, opacity = 1 }: { t: number; opacity?: number }) {
  const { width, height } = useVideoConfig()
  const state = useMemo(() => worldAt(t), [t])
  return (
    <AbsoluteFill style={{ opacity }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 34, near: 0.1, far: 200, position: [0, 0, 40] }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Stage />
        <CameraRig pose={state.pose} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[4, 6, 8]} intensity={2.4} color="#dbe6ff" />
        <directionalLight position={[-6, -2, 4]} intensity={1.0} color="#8194ff" />
        <AIFlowNetwork state={state} />
        <Prism3D state={state.prism} fov={state.pose.fov} />
      </ThreeCanvas>
    </AbsoluteFill>
  )
}
