import * as THREE from 'three'

const BASE = 255

const setOne = (data, i) => {
  data[i * 4] = 255
  data[i * 4 + 1] = 255
  data[i * 4 + 2] = 255
  data[i * 4 + 3] = 255
}

const setZero = (data, i) => {
  data[i * 4] = 0
  data[i * 4 + 1] = 0
  data[i * 4 + 2] = 0
  data[i * 4 + 3] = 0
}

export const encode = (value, scale) => {
  const b = BASE
  value = value * scale + (b * b) / 2
  const pair = [
    Math.floor(((value % b) / b) * 255),
    Math.floor((Math.floor(value / b) / b) * 255),
  ]
  return pair
}

export const decode = (pair, scale) => {
  const b = BASE
  return ((pair[0] / 255) * b + (pair[1] / 255) * b * b - (b * b) / 2) / scale
}

export const initParticles = ({ width, height }) => {
  const posData = new Uint8Array(4 * width * height)
  const velData = new Uint8Array(4 * width * height)

  for (let i = 0; i < width * height; i++) {
    if (Math.random() < 0.2) {
      setOne(posData, i)
    } else {
      setZero(posData, i)
    }
  }

  const position = new THREE.DataTexture(
    posData,
    width,
    height,
    THREE.RGBAFormat
  )
  const velocity = new THREE.DataTexture(
    velData,
    width,
    height,
    THREE.RGBAFormat
  )

  return {
    position,
    velocity,
  }
}

export const addParticle = (data, col, row) => {
  setOne(data, col + row * WIDTH)
}
