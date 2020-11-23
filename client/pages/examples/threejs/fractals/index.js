import React from 'react'
import * as THREE from 'three'
import threeOrbitControls from 'three-orbit-controls'

import Example from '-/components/example'
import notes from './readme.md'
import FractalPicker from './elements/fractal-picker'
import ShapePicker from './elements/shape-picker'

const vs = `
precision highp float;
varying vec2 uv2;
void main(){
  uv2 = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
}`

const mandelbrotFs = `
precision highp float;
varying vec2 uv2;
const int MAXSTEPS = 160;
uniform float iTime;

vec4 mandelbrot(vec2 c){
  vec2 z = c;
  for (int i = 0; i < MAXSTEPS; i += 1) {
    float x = z.x * z.x - z.y * z.y + c.x;
    float y = 2.0 * z.y * z.x + c.y;
    if ((x*x + y*y) > 4.0) {
      return vec4(
        0.0,
        (cos(float(i) - iTime) + 1.0) / 2.5,
        (sin(float(i) - iTime) + 1.0) / 2.25,
        1.0
      );
    }
    z.x = x;
    z.y = y;
  }
  return vec4(0.0, 0.0, 0.0, 0.0);
}

const vec2 target = vec2(
  -0.743643887037158704752191506114774,
  0.131825904205311970493132056385139
);

void main(){
  float zoom = pow(mod(iTime, 60.0) / 2.0, 3.0);
  float xoff = ((uv2.x * 2.0 - 1.0) / zoom) + target.x;
  float yoff = ((uv2.y * 2.0 - 1.0) / zoom) + target.y;
  vec2 c = vec2(xoff, yoff);
  vec4 color = mandelbrot(c);
  gl_FragColor = color;
}
`

const juliaSetFs = `
varying vec2 uv2;
const int MAXSTEPS = 30;
const float PI = 3.141592653589793238462643383279502884197169399375105;
uniform float iTime;

mat4 rotateZ(float theta){
  float c = cos(theta);
  float s = sin(theta);
  return mat4(
    vec4(c, s, 0, 0),
    vec4(-s, c, 0, 0),
    vec4(0, 0, 1, 0),
    vec4(0, 0, 0, 1)
  );
}

vec4 julia(vec2 c){
  vec2 z = c;
  float a = PI + (sin(iTime/7.0) + 1.0) / 2.0 * 0.5;
  float r = 1.0;
  for (int i = 0; i < MAXSTEPS; i += 1) {
    float x = pow(z.x, 2.0) - pow(z.y, 2.0) + r * cos(a);
    float y = 2.0 * z.y * z.x + r * sin(a);
    if ((x*x + y*y) > 4.0) {
      return vec4(
        0.0,
        (sin(float(i)/float(MAXSTEPS)) + 1.0) / 2.25,
        (sin(float(i)/float(MAXSTEPS)) + 1.0) / 2.0,
        1.0
      );
    }
    z.x = x;
    z.y = y;
  }
  return vec4(0.0, 0.0, 0.0, 0.0);
}

const vec2 target = vec2(
  0.0,
  0.0
);

void main(){
  float zoom = 1.25;
  float xoff = ((uv2.x * 2.0 - 1.0) / zoom) + target.x;
  float yoff = ((uv2.y * 2.0 - 1.0) / zoom) + target.y;
  vec2 c = vec2(xoff, yoff);

  vec4 color = julia((vec4(c, 1.0, 1.0) * rotateZ(iTime/20.0)).xy);
  gl_FragColor = color;
}
`

const init = ({ canvas, container, state }) => {
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientWidth, 0.1, 1000)
  camera.position.z = 75

  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(canvas.clientWidth, canvas.clientWidth)

  const OrbitControls = threeOrbitControls(THREE)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.update()

  let scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  const light = new THREE.PointLight(0x00ff00, 2, 100)
  light.position.set(0, 20, 30)
  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 0.5
  light.shadow.camera.far = 500
  scene.add(light)

  const planeGeometry = new THREE.PlaneBufferGeometry(200, 200, 200, 200)
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -Math.PI / 2
  plane.position.z = 1
  plane.position.y = -50
  plane.receiveShadow = true
  scene.add(plane)

  const geometry =
    state.shape === 'plane'
      ? new THREE.PlaneBufferGeometry(100, 100, 100, 100)
      : state.shape === 'sphere'
        ? new THREE.SphereBufferGeometry(50, 32, 32)
        : state.shape === 'cylinder'
          ? new THREE.CylinderBufferGeometry(25, 25, 50, 32)
          : new THREE.TorusKnotBufferGeometry(25, 12, 120, 16)
  const iTime = {
    type: 'f',
    value: 0
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: vs,
    fragmentShader: state.fractal === 'mandelbrot' ? mandelbrotFs : juliaSetFs,
    side: THREE.DoubleSide,
    uniforms: {
      iTime: iTime
    }
  })
  const object = new THREE.Mesh(geometry, material)
  object.position.z = 0.0
  object.rotation.y = Math.PI
  object.receiveShadow = true
  object.castShadow = true
  scene.add(object)

  let then = 0
  const animate = (now) => {
    const nowSecs = now * 0.001
    const deltaSecs = nowSecs - then
    then = nowSecs

    controls.update()

    iTime.value = nowSecs

    if (renderer) {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
  }
  animate()

  return () => {
    renderer.dispose()

    scene = null
    renderer = null
  }
}

const wrap = (Component, { ...first }) => ({ children, context, ...rest }) => (
  <Component {...first} {...rest}>
    {children}
  </Component>
)

const PointLightExample = () => {
  const [fractal, setFractal] = React.useState('mandelbrot')
  const [shape, setShape] = React.useState('plane')
  return (
    <Example
      notes={notes}
      init={init}
      components={{
        FractalPicker: wrap(FractalPicker, {
          fractal,
          setFractal
        }),
        ShapePicker: wrap(ShapePicker, {
          shape,
          setShape
        })
      }}
      state={{ fractal, shape }}
    />
  )
}

export default PointLightExample
