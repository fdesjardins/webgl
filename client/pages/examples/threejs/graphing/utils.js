import droidSans from '-/assets/fonts/helvetiker_bold.typeface.json'
import * as THREE from 'three'

export const createAxes = ({ size, fontSize = 3 }) => {
  const fontLoader = new THREE.FontLoader()
  const font = fontLoader.parse(droidSans)
  const axes = new THREE.AxesHelper(size)

  const xLabel = new THREE.Mesh(
    new THREE.TextGeometry('X', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  xLabel.position.x = size
  axes.add(xLabel)

  const yLabel = new THREE.Mesh(
    new THREE.TextGeometry('Y', {
      size: fontSize,
      height: fontSize * 0.1,
      font,
      curveSegments: 3
    }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
  yLabel.position.y = size
  axes.add(yLabel)

  // const zLabel = new THREE.Mesh(
  //   new THREE.TextGeometry('-Z', {
  //     size: fontSize,
  //     height: fontSize * 0.1,
  //     font,
  //     curveSegments: 3
  //   }),
  //   new THREE.MeshBasicMaterial({ color: 0x000000 })
  // )
  // zLabel.position.z = size
  // axes.add(zLabel)

  return axes
}

export const createLabel = ({ text, color = 0x000000, size = 1.5 }) => {
  const fontLoader = new THREE.FontLoader()
  const font = fontLoader.parse(droidSans)
  const label = new THREE.Mesh(
    new THREE.TextGeometry(text, {
      size,
      height: size * 0.1,
      font,
      curveSegments: 3
    }),
    new THREE.MeshBasicMaterial({ color })
  )
  return label
}

export const createLineGraph = (
  f,
  labelText,
  color = 0x0000ff,
  style = 'solid'
) => {
  // const f = t => x => 5 * Math.sin(x + t / 200)
  const range = [-10 * Math.PI, 10 * Math.PI]
  const res = 0.1

  let i = range[0]
  const points = []
  while (i <= range[1]) {
    points.push(new THREE.Vector3(i, f(0)(i), 0))
    i += res
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  console.log(style)
  const material =
    style === 'dashed'
      ? new THREE.LineDashedMaterial({
          color,
          linewidth: 2,
          gapSize: 2,
          dashSize: 3
        })
      : new THREE.LineBasicMaterial({ color, linewidth: 2 })

  const object = new THREE.Line(geometry, material)
  object.computeLineDistances()

  const label = createLabel({ text: labelText })
  label.position.x = 5 * Math.PI + 1
  label.position.y = 6
  object.add(label)

  return {
    object,
    animate: now => {
      points.map((p, i) => {
        object.geometry.attributes.position.array[i * 3 + 1] = f(now)(p.x)
      })
      object.geometry.attributes.position.needsUpdate = true
    }
  }
}

export const create3dGraph = (_, labelText) => {
  const f = t => (x, z, vec) => {
    vec.x = x * 20 * Math.PI - 10 * Math.PI
    vec.y =
      2 * Math.sin(x * 20 * Math.PI + t) +
      2 * Math.sin(z * 20 * Math.PI + t) -
      20
    vec.z = z * 20 * Math.PI - 10 * Math.PI
  }
  const range = [-10 * Math.PI, 10 * Math.PI]
  const geometry = new THREE.ParametricBufferGeometry(f(0), 100, 100)
  const wireframe = new THREE.WireframeGeometry(geometry)
  const material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 1
  })
  const object = new THREE.LineSegments(wireframe, material)

  const label = createLabel({ text: 'f(x,z) = sin(x) + sin(z)' })
  label.position.y = -14
  label.position.x = 5 * Math.PI + 1
  object.add(label)

  return {
    object,
    animate: now => {
      object.geometry = new THREE.ParametricBufferGeometry(f(now / 200), 65, 65)
    }
  }
}

export const createGraph = (f, labelText) => {
  // const f = x => Math.sin(x)
  const range = [0, 20 * Math.PI]
  const res = 0.1

  const geometry = new THREE.SphereGeometry(0.25)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const object = new THREE.Mesh(geometry, material)

  let i = 0
  const objects = []
  while (i <= range[1]) {
    const g = new THREE.SphereGeometry(0.25)
    const m = new THREE.MeshPhongMaterial({ color: 0xffffff })
    const o = new THREE.Mesh(g, m)
    o.position.x = i
    o.position.y = f(i)
    object.add(o)
    objects.push(o)
    i += res
  }

  const label = createLabel({ text: labelText })
  label.position.y = 2
  object.add(label)

  object.matrixAutoUpdate = true
  const animate = () => {}
  // now => {
  //   objects.map(o => {
  //     o.position.y = f(o.position.x + now / 1000)
  //   })
  // }
  return { object, animate }
}
