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
  camera.position.set(5, 5, 10)
  return () => {}
}
