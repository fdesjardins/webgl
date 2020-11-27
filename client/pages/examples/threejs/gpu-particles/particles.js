import * as THREE from 'three'

export const set = (data, i) => {
  data[i * 3] = 255
  data[i * 3 + 1] = 255
  data[i * 3 + 2] = 255
}

export const initParticles = ({ width, height }) => {
  const data = new Uint8Array(3 * width * height)
  for (let i = 0; i < width * height * 3; i++) {
    const stride = i * 3
    data[stride] = 0
    data[stride + 1] = 255
    data[stride + 2] = 255
    // data[stride] = 0
    // data[stride + 1] = 0
    // data[stride + 2] = 0
  }
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBFormat)
  tex.needsUpdate = true
  return tex
}

export const addParticle = (data, col, row) => {
  set(data, col + row * WIDTH)
}
