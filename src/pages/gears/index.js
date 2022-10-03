import fs from './fs.glsl'
import texture from './rusty-metal-512x512.jpg'

export const meta = {
  tags: 'threejs,ray marching',
  title: 'Raymarched Gears',
  slug: 'gears',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
    iChannel0: texture,
  },
}

export const init = ({ camera }) => {
  camera.position.set(6, 6, 6)
  camera.lookAt(0, 0, 0)
}
