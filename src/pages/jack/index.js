import fs from './fs.glsl'

export const meta = {
  tags: 'ray marching',
  title: "Jack-o'-lantern",
  // slug: 'sdf-tunnel',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs,
  },
}

export const init = ({ camera, controls }) => {
  camera.position.set(-3.7, -1.2, 13)
  camera.lookAt(0, 0, 0)
  return () => {}
}
