import fs from './fs.glsl'

export const meta = {
  tags: 'threejs,ray marching',
  title: 'Landscape',
  slug: 'landscape',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(-9, 1.5, 5)
  return () => {}
}
