import fs from './fs.glsl'

export const meta = {
  tags: 'threejs,ray marching',
  title: 'Reflections',
  slug: 'reflections',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(10, 3, 10)
  controls.autoRotate = true
  return () => {}
}
