import fs from './fs.glsl'

export const meta = {
  tags: 'math',
  title: 'Waves',
  slug: 'waves',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(0, 0, -1)
  controls.enableRotate = false
  return () => {}
}
