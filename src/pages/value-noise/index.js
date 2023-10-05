import fs from './fs.glsl'

export const meta = {
  tags: 'noise,math',
  title: 'Value Noise',
  slug: 'value-noise',
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
