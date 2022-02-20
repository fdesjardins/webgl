import vs from './vs.glsl'
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
    vs,
    fs,
  },
}

export const init = ({ controls }) => {
  // const i = setInterval(() => controls, 5e3)
  controls.autoRotate = true
  return () => {} // clearInterval(i)
}
