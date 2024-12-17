import fs from './fs.glsl'

export const meta = {
  tags: 'threejs,math',
  title: '3D Graph',
  slug: '3d-graph',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(0, 0.8, 2)
  camera.lookAt(0, 0, 0)
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.75
}
