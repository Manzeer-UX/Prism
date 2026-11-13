/**
 * Shader materials for the 3D world.
 *
 * Glows and lines add light to the frame without touching its alpha, so the
 * transparent WebGL canvas composites over the DOM backdrop as pure light.
 * Colours are passed as linear THREE.Color values and converted on output.
 */
import * as THREE from 'three'

export function glowBlend<T extends THREE.Material>(m: T): T {
  m.transparent = true
  m.depthWrite = false
  m.blending = THREE.CustomBlending
  m.blendEquation = THREE.AddEquation
  m.blendSrc = THREE.OneFactor
  m.blendDst = THREE.OneFactor
  m.blendEquationAlpha = THREE.AddEquation
  m.blendSrcAlpha = THREE.ZeroFactor
  m.blendDstAlpha = THREE.OneFactor
  return m
}

/* ------------------------------------------------------------ glow points */

export function glowPointsMaterial() {
  return glowBlend(
    new THREE.ShaderMaterial({
      uniforms: { uProjScale: { value: 1000 } },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute vec3 aColor;
        uniform float uProjScale;
        varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float px = aSize * uProjScale / max(0.2, -mv.z);
          gl_PointSize = clamp(px, 0.0, 900.0);
          vColor = aColor * smoothstep(0.0, 1.5, px);
          if (mv.z > -0.15) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c) * 2.0;
          if (d > 1.0) discard;
          float halo = pow(1.0 - d, 2.4);
          float core = pow(max(0.0, 1.0 - d * 2.6), 2.0);
          gl_FragColor = vec4(vColor * (halo * 0.55 + core * 1.6), 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
  )
}

/* ------------------------------------------------------------ edge batch */

export function edgeMaterial() {
  return glowBlend(
    new THREE.ShaderMaterial({
      // screen-space quads can face either way
      side: THREE.DoubleSide,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1920, 1080) },
        uProjScale: { value: 1000 },
        uMinPx: { value: 1.1 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aStart;
        attribute vec3 aEnd;
        attribute float aSide;
        attribute float aAlong;
        attribute vec3 aColor;
        attribute float aWidth;
        uniform vec2 uResolution;
        uniform float uProjScale;
        uniform float uMinPx;
        varying vec3 vColor;
        varying float vSide;
        void main() {
          vec4 a = modelViewMatrix * vec4(aStart, 1.0);
          vec4 b = modelViewMatrix * vec4(aEnd, 1.0);
          float near = 0.2;
          vColor = aColor;
          vSide = aSide;
          if (a.z > -near && b.z > -near) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          if (a.z > -near) a.xyz = mix(b.xyz, a.xyz, (-near - b.z) / (a.z - b.z));
          if (b.z > -near) b.xyz = mix(a.xyz, b.xyz, (-near - a.z) / (b.z - a.z));
          vec4 ca = projectionMatrix * a;
          vec4 cb = projectionMatrix * b;
          vec2 sa = ca.xy / ca.w * 0.5 * uResolution;
          vec2 sb = cb.xy / cb.w * 0.5 * uResolution;
          vec2 d = sb - sa;
          float len = length(d);
          vec2 dir = len > 0.0001 ? d / len : vec2(1.0, 0.0);
          vec2 n = vec2(-dir.y, dir.x);
          vec4 cp = mix(ca, cb, aAlong);
          float depth = max(0.2, -mix(a.z, b.z, aAlong));
          float px = max(uMinPx, aWidth * uProjScale / depth);
          // thin lines fade instead of shimmering
          vColor *= clamp(px / uMinPx, 0.0, 1.0) * clamp(len / 2.0, 0.0, 1.0);
          px += 2.0;
          // curves are sampled finely enough that joints need no caps (caps would overlap and bead)
          vec2 off = n * px * aSide / uResolution * cp.w;
          gl_Position = cp + vec4(off, 0.0, 0.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vSide;
        void main() {
          float d = abs(vSide);
          float core = 1.0 - smoothstep(0.18, 0.62, d);
          float halo = exp(-d * d * 5.0) * 0.38;
          gl_FragColor = vec4(vColor * (core + halo), 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
  )
}

/* ----------------------------------------------------------------- nodes */

export function nodeMaterial() {
  return new THREE.ShaderMaterial({
    // far nodes dissolve into the backdrop rather than fogging to a flat colour
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: true,
    uniforms: {
      uFogNear: { value: 18 },
      uFogFar: { value: 54 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aGlow;
      varying vec3 vView;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        vec4 local = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          local = instanceMatrix * local;
        #endif
        vec4 mv = modelViewMatrix * local;
        vView = mv.xyz;
        vColor = aColor;
        vGlow = aGlow;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFogNear;
      uniform float uFogFar;
      varying vec3 vView;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
        vec3 v = normalize(-vView);
        float ndv = clamp(abs(dot(n, v)), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 2.2);
        vec3 L = normalize(vec3(0.35, 0.8, 0.55));
        float diff = clamp(dot(n, L), 0.0, 1.0);
        float spec = pow(clamp(dot(reflect(-L, n), v), 0.0, 1.0), 24.0);
        vec3 body = vec3(0.012, 0.016, 0.03) + vColor * 0.05;
        vec3 col = body * (0.5 + 1.2 * diff);
        col += vColor * (0.12 + fres * 1.1) * (0.45 + vGlow);
        col += vColor * vGlow * 0.5;
        col += vec3(0.85, 0.9, 1.0) * spec * 0.22;
        float fog = smoothstep(uFogNear, uFogFar, -vView.z);
        float alpha = 1.0 - fog * 0.92;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
        gl_FragColor = vec4(gl_FragColor.rgb * alpha, alpha);
      }
    `,
  })
}

/* ------------------------------------------------------ prism inner light */

export function innerLightMaterial() {
  return glowBlend(
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uIntensity: { value: 0 },
        uSpectrum: { value: 0 },
        uHalfWidth: { value: 1.3 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vPos;
        varying vec3 vView;
        varying vec3 vNormalV;
        void main() {
          vPos = position;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = mv.xyz;
          vNormalV = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uIntensity;
        uniform float uSpectrum;
        uniform float uHalfWidth;
        varying vec3 vPos;
        varying vec3 vView;
        varying vec3 vNormalV;
        vec3 spectrum(float x) {
          // violet → blue → teal → green, the site's capability hues
          vec3 a = vec3(0.62, 0.54, 0.98);
          vec3 b = vec3(0.37, 0.62, 0.99);
          vec3 c = vec3(0.04, 0.74, 0.82);
          vec3 d = vec3(0.25, 0.78, 0.55);
          return x < 0.33 ? mix(a, b, x / 0.33) : x < 0.66 ? mix(b, c, (x - 0.33) / 0.33) : mix(c, d, (x - 0.66) / 0.34);
        }
        void main() {
          float fres = pow(1.0 - clamp(abs(dot(normalize(vNormalV), normalize(-vView))), 0.0, 1.0), 1.6);
          float x = clamp(vPos.x / uHalfWidth * 0.5 + 0.5, 0.0, 1.0);
          vec3 white = vec3(0.86, 0.9, 1.0);
          vec3 col = mix(white, spectrum(clamp((x - 0.35) / 0.65, 0.0, 1.0)), smoothstep(0.3, 0.9, x) * uSpectrum);
          float body = 0.05 + fres * 0.7;
          gl_FragColor = vec4(col * body * uIntensity, 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
  )
}
