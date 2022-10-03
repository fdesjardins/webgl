import fs from './fs.glsl'

export const meta = {
  tags: 'threejs',
  title: 'Julia Fractal',
  slug: 'julia-fractal',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}
