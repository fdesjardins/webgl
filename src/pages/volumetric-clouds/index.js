import fs from './fs.glsl'

export const meta = {
  tags: 'math',
  title: 'Volumetric Clouds',
  slug: 'volumetric-clouds',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(0, 1, 3)
  // controls.autoRotate = true
  controls.autoRotateSpeed = 0.5
  return () => {}
}
