import fs from './fs.glsl'

export const meta = {
  tags: 'threejs,ray marching',
  title: 'Volumetric Effects',
  slug: 'volumetric',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(4, 2, 4)
  controls.autoRotate = true
  controls.autoRotateSpeed = 3.0
  return () => {}
}
