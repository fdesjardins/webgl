import vs from './vs.glsl'
import fs from './fs.glsl'

export const meta = {
  tags: 'threejs,ray marching',
  title: 'Ray Marching Gears',
  slug: 'gears',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    vs,
    fs,
  },
}
