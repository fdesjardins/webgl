import fs from './fs.glsl'
import textureN from './images/1.crop.png'
import textureE from './images/2.crop.png'
import textureS from './images/3.crop.png'
import textureW from './images/4.crop.png'
// import textureN from './pafa-cal/1.avif'
// import textureE from './pafa-cal/2.avif'
// import textureS from './pafa-cal/3.avif'
// import textureW from './pafa-cal/4.avif'
// import texture from './m3.jpg'
// import texture from './images/4.avif'
import * as THREE from 'three'
import store from './state'

export const meta = {
  tags: 'math',
  title: 'Image Warping',
  slug: 'image-warping',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    // fs,
    fs: `void main(){
      gl_FragColor = vec4(0.,0.,0.,1.);
      gl_FragDepth = 100.0;
    }`,
    // iChannel0: texture,
  },
}

const loader = new THREE.TextureLoader()

const mkSphere = (
  uniforms,
  image,
  offsetX = 0,
  offsetY = 0,
  rotation = 0,
  vCoeffs = [0, 0, 0],
  EV = 0,
  Er = 1,
  Eb = 1,
) => {
  console.log(vCoeffs, offsetY)
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 256, 256),
    new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 texCoord;
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          texCoord = vec2(gl_Position.x, gl_Position.y);
        }`,
      fragmentShader: fs,
      uniforms: {
        ...uniforms,
        iSphere: {
          value: true,
        },
        iChannel0: {
          value: loader.load(image),
        },
        iOffsetX: {
          value: offsetX || 0.0,
        },
        iOffsetY: {
          value: offsetY || 0.0
        },
        iRotation: {
          value: rotation,
        },
        // Vignetting coefficients
        iVa: {
          value: 0,
        },
        iVb: {
          value: vCoeffs[0],
        },
        iVc: {
          value: vCoeffs[1],
        },
        iVd: {
          value: vCoeffs[2],
        },
        iEV: {
          value: EV,
        },
        iEr: {
          value: Er,
        },
        iEb: {
          value: Eb,
        },
      },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      opacity: 0.0,
    }),
  )
  return sphere
}

const look = (camera, dir) => {
  const map = {
    N: [-0.1, 0, 0],
    NE: [-0.1, 0, -0.1],
    E: [0, 0, -0.1],
    SE: [0.1, 0, -0.1],
    S: [0.1, 0, 0],
    SW: [0.1, 0, 0.1],
    W: [0, 0, 0.1],
    NW: [-0.1, 0, 0.1],
  }
  camera.position.set(...map[dir])
}

const add = (
  scene,
  texture,
  uniforms,
  rotY = 0,
  rotTexture = 0,
  tX = 0,
  tY = 0,
  vCoeffs = [0, 0, 0],
  EV = 0,
  Er = 1,
  Eb = 1,
) => {
  const sphere = mkSphere(uniforms, texture, tX, tY, rotTexture, vCoeffs, EV, Er, Eb)
  sphere.position.set(0, 0, 0)
  sphere.rotateY(THREE.MathUtils.degToRad(rotY))
  scene.add(sphere)
  return sphere
}

export const init = ({ camera, canvas, scene, uniforms, controls, mesh }) => {
  camera.position.set(...store.getState().position)

  camera.fov = store.getState().fov
  camera.updateProjectionMatrix()

  const wheelListener = canvas.addEventListener('wheel', (event) => {
    console.log('wheel', event)
    camera.fov += -1e-2 * event.wheelDelta
    camera.updateProjectionMatrix()
    store.setState({ fov: camera.fov })
  })
  const cameraPositionInterval = setInterval(() => {
    store.setState({ position: camera.position })
  }, 100)

  // Meshes and configs for Rampart
  const vCoeffs = [-0.134, -0.083, -0.083]
  // let meshes = [
  //   add(scene, textureN, uniforms, 0, -0.09, 0, 0.004, vCoeffs, 0, 1, 1),
  //   add(scene, textureE, uniforms, -90, -0.015, 0, -0.0, vCoeffs, 0.1, 1.05, 0.96),
  //   add(scene, textureS, uniforms, -180, -0.03, 0, 0, vCoeffs, -0.2, 0.95, 1.1),
  //   add(scene, textureW, uniforms, -270, -0.04, 0, 0, vCoeffs, -0.1, 0.98, 1.1),
  // ]

  // Thompson Pass
  // let meshes = [
  //   add(scene, textureN, uniforms, 0, -0.0, 0, 0.015, vCoeffs, 0, 1, 1),
  //   add(scene, textureE, uniforms, -90, 0.1, 0, 0.0, vCoeffs, 0.1, 1.05, 0.96),
  //   add(scene, textureS, uniforms, -180, 0.1, 0, 0.01, vCoeffs, -0.2, 0.95, 1.1),
  //   add(scene, textureW, uniforms, -270, 0.05, 0, 0.0, vCoeffs, -0.1, 0.98, 1.1),
  // ]

  // Whittier
  let meshes = [
    add(scene, textureN, uniforms, 0, -0.015, 0, 0.024, vCoeffs, 0, 1, 1),
    add(scene, textureE, uniforms, -90, -0.02, 0, 0.0, vCoeffs, 0.1, 1.05, 0.96),
    add(scene, textureS, uniforms, -180, 0.015, 0, 0.0, vCoeffs, -0.2, 0.95, 1.1),
    add(scene, textureW, uniforms, -270, 0.018, 0.0, 0.022, vCoeffs, -0.1, 0.98, 1.1),
  ]

  // Hugin calibration outputs for exposures and vignette constants
  // N: EV0    Er1    Eb1    Vb-0.134 Vc-0.083 Vd0.046
  // E: EV0.1  Er1.05 Eb0.96 Vb-0.134 Vc-0.083 Vd0.046
  // S: EV-0.2 Er0.95 Eb1.16 Vb-0.134 Vc-0.083 Vd0.046
  // W: EV-0.1 Er0.98 Eb1.06 Vb-0.134 Vc-0.083 Vd0.046

  // const gui = new GUI()
  // const fractalFolder = gui.addFolder('Fractals')
  // fractalFolder.open()

  // const api = {
  //   fractal: 'mandelbrot',
  // }
  // const settings = {
  //   fractals: ['mandelbrot', 'julia'],
  // }
  // const fractalsCtrl = fractalFolder.add(api, 'fractal').options(settings.fractals)
  // fractalsCtrl.onChange(() => {
  //   if (api.fractal === 'mandelbrot') {
  //     // mesh.material.fragmentShader = mandelbrot
  //     mesh.material.uniforms = null
  //   }
  //   mesh.material.needsUpdate = true
  // })

  // return () => {
  //   gui.destroy()
  // }

  return () => {
    clearInterval(cameraPositionInterval)
  }
}
