import fs from './fs.glsl'

export const meta = {
  tags: 'math',
  title: 'Volumetric Clouds 2',
  slug: 'volumetric-clouds-2',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(7, -4, 7)
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5
  return () => {}
}
