import vs from './vs.glsl'
import fs from './fs.glsl'

export const meta = {
  tags: 'threejs,ray marching',
  title: 'Menger Fractal',
  slug: 'menger',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    vs,
    fs,
  },
}
