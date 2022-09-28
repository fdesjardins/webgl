import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

import inconsolataFont from '../../fonts/Inconsolata/Inconsolata_Regular.json'

// Create X,Y,Z colored axes indicators and labels
export const createAxes = ({ size, fontSize = 3 }) => {
  const fontLoader = new FontLoader()
  const font = fontLoader.parse(inconsolataFont)
  const axes = new THREE.AxesHelper(size)

  const xLabel = new THREE.Mesh(
    new TextGeometry('X', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  xLabel.position.x = size
  axes.add(xLabel)

  const yLabel = new THREE.Mesh(
    new TextGeometry('Y', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  yLabel.position.y = size
  axes.add(yLabel)

  const zLabel = new THREE.Mesh(
    new TextGeometry('-Z', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3,
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  zLabel.position.z = size
  axes.add(zLabel)

  return axes
}
