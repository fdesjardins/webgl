import fs from './fs.glsl'

export const meta = {
  tags: 'math',
  title: 'Mandelbulb',
  slug: 'mandelbulb',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(0, 0, 3)
  // controls.autoRotate = true
  return () => {}
}
