import fs from './fs.glsl'

export const meta = {
  tags: 'ray marching',
  title: 'SDF Tunnel',
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
