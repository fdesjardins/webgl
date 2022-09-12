import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry'

export const meta = {
  tags: 'threejs,webvr',
  title: 'Hello WebVR',
  slug: 'hello-webvr',
}

export const options = {
  display: 'fullscreen',
}

export const init = ({ canvas, container }) => {
  let scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )

  camera.position.set(0, 2, 2)
  camera.rotation.set(0, 0, 0)

  let renderer = new THREE.WebGLRenderer({ canvas })
  renderer.xr.enabled = true

  const button = VRButton.createButton(renderer)
  container.appendChild(button)

  renderer.setSize(container.clientWidth, container.clientHeight)

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: 0xff00ff })
  const cube = new THREE.Mesh(geometry, material)
  cube.matrixAutoUpdate = true
  cube.castShadow = true
  cube.position.set(0, 2, -2)
  scene.add(cube)

  const room = new THREE.LineSegments(
    new BoxLineGeometry(6, 6, 6, 10, 10, 10),
    new THREE.LineBasicMaterial({ color: 0x808080 })
  )
  room.geometry.translate(0, 3, 0)
  scene.add(room)

  const light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 4, 0)
  scene.add(light)

  const animate = () => {
    if (!renderer) {
      return
    }

    renderer.render(scene, camera)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
  }
  renderer.setAnimationLoop(animate)

  return () => {
    renderer.dispose()
    scene = null
    renderer = null
  }
}
