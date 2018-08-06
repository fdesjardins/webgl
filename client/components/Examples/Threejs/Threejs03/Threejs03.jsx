import Inferno from 'inferno'
import { default as utils, sq } from '-/utils'
import * as THREE from 'three'
import Promise from 'bluebird'

import Example from '-Example'
import './Threejs03.scss'
import notes from './readme.md'
import stationsData from './stations.json'

const globals = {
  stations: [],
  fontLoader: new THREE.FontLoader(),
  font: null,
  colors: {
    stations: 0x4466ff,
    stationLabels: 0xffffff
  }
}

/**
 * Create a station mesh object
 */
const createStation = station => {
  const stationGeom = new THREE.IcosahedronBufferGeometry(0.35, 0)
  const stationMat = new THREE.MeshPhongMaterial({
    color: globals.colors.stations
  })
  const polyhedron = new THREE.Mesh(stationGeom, stationMat)
  const pos = calcPosFromLatLonRad(station.latitude, station.longitude, 30)
  polyhedron.position.set(...pos)
  return polyhedron
}

/**
 * Create a station mesh label
 */
const createStationLabel = station => {
  const textMat = new THREE.MeshPhongMaterial({
    color: globals.colors.stationLabels
  })
  const defaultTextBufferGeomOpts = {
    size: 0.25,
    height: 0.25,
    curveSegments: 3,
    bevelEnabled: false
  }
  const textGeom = new THREE.TextBufferGeometry(
    station.stationName,
    Object.assign({}, defaultTextBufferGeomOpts, {
      font: globals.font
    })
  )
  const text = new THREE.Mesh(textGeom, textMat)
  const pos = calcPosFromLatLonRad(station.latitude, station.longitude, 30)
  text.position.set(...pos)
  return text
}

/**
 * Load the stations data into the given scene
 */
const loadStations = async scene => {
  await new Promise((resolve, reject) => {
    globals.fontLoader.load('/dist/droidsansbold.typeface.json', font => {
      globals.font = font
      resolve()
    })
  })
  const loadStations = stationsData.stations.map(s => async () => {
    const station = createStation(s)
    const label = createStationLabel(s)
    scene.add(station)
    scene.add(label)
    globals.stations.push(station)
  })
  Promise.map(loadStations, x => x().delay(100), { concurrency: 15 })
}

/**
 * didMount()
 */
const didMount = async () => {
  const canvas = document.querySelector('#threejs03 canvas')
  const container = document.querySelector('#threejs03')

  // Create the scene and renderer
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setSize(container.clientWidth, container.clientHeight)

  // Add the camera
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    1,
    1000
  )
  camera.position.z = 50

  // Add the main light source
  const light = new THREE.PointLight(0xffffff, 2, 200)
  light.position.set(0, 40, 40)
  scene.add(light)

  let frame = 0
  const animate = () => {
    requestAnimationFrame(animate)

    globals.stations.map((p, i) => {
      p.rotation.x += 0.01
    })

    // camera.position.y = 15 * Math.sin(frame / 15) * 1
    // camera.position.x = 15 * Math.cos(frame / 15) * 2
    // camera.lookAt(new THREE.Vector3(0, 0, 0))

    renderer.render(scene, camera)
    frame += 0.1
  }
  animate()

  loadStations(scene)
}

/**
 * Calculate a 3D position from a lat,lng pair and radius.
 */
const calc3dPosFromLatLonRad = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return [x, y, z]
}

/**
 * Calculate a 3D position from a lat,lng pair and radius
 */
const calcPosFromLatLonRad = (lat, lon, radius) => {
  var shift = Math.PI * radius
  var x = (lon * shift) / 180
  var y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)
  y = (y * shift) / 180

  return [x, y, 0]
}

const Canvas = ({ id }) => {
  return <canvas id={id} />
}

const Threejs0301 = ({ color, id }) => {
  return <Canvas id={id} onComponentDidMount={didMount} />
}

/**
 * Main Threejs example component
 */
const Threejs03 = ({ children }, { store }) => {
  const components = {
    Threejs0301: ({ color, id }) => <Threejs0301 color={color} id={id} />
  }
  return (
    <div id="threejs03">
      <Example
        notes={notes}
        onComponentShouldUpdate={utils.shouldUpdate}
        components={components}
      />
    </div>
  )
}

export default Threejs03
