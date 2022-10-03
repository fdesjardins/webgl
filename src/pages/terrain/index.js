import fs from './fs.glsl'

export const meta = {
  tags: 'threejs,ray marching',
  title: 'Raymarched Terrain',
  slug: 'terrain',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera }) => {
  camera.position.set(-8, 0.75, 6)
  return () => {}
}
