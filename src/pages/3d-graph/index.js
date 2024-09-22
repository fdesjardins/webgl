import fs from './fs.glsl'

export const meta = {
  tags: 'threejs,math',
  title: '3D Graph',
  slug: '3d-graph',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera }) => {
  camera.position.set(0, 0, -1)
  camera.lookAt(0, 0, 0)
}
