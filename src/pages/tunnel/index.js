import fs from './fs.glsl'
import texture from './rusty-metal-512x512.jpg'

export const meta = {
  tags: 'raymarching',
  title: 'Tunnel',
  slug: 'tunnel',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
    iChannel0: texture,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(0, 0, -1)
  controls.enableRotate = false
  return () => {}
}
