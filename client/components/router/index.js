import React, { Suspense } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

import Home from '-/pages/home'

const HelloWorld = React.lazy(() =>
  import('-/pages/examples/basics/hello-world')
)
const Twgljs = React.lazy(() => import('-/pages/examples/basics/twgljs'))
const Lighting = React.lazy(() => import('-/pages/examples/basics/lighting'))
const TexturesAndBlending = React.lazy(() =>
  import('-/pages/examples/basics/textures-and-blending')
)
const LoadingObjects = React.lazy(() =>
  import('-/pages/examples/basics/loading-objects')
)
const HelloThreejs = React.lazy(() =>
  import('-/pages/examples/threejs/hello-threejs')
)
const PointLight = React.lazy(() =>
  import('-/pages/examples/threejs/point-light')
)
const GameOfLife = React.lazy(() =>
  import('-/pages/examples/threejs/game-of-life')
)
const VideoTexture = React.lazy(() =>
  import('-/pages/examples/threejs/video-texture')
)
const DrawingAxes = React.lazy(() =>
  import('-/pages/examples/threejs/drawing-axes')
)
const RayMarching = React.lazy(() =>
  import('-/pages/examples/threejs/ray-marching')
)
const HelloWebVr = React.lazy(() =>
  import('-/pages/examples/threejswebvr/hello-threejswebvr')
)
const VRInput = React.lazy(() =>
  import('-/pages/examples/threejswebvr/vr-input')
)
const ChildWorker = React.lazy(() =>
  import('-/pages/examples/threejswebvr/worker')
)
const Fractals = React.lazy(() => import('-/pages/examples/threejs/fractals'))
const Graphing = React.lazy(() => import('-/pages/examples/threejs/graphing'))
const OimoPhysics = React.lazy(() =>
  import('-/pages/examples/threejs/oimophysics')
)
const RayCasting = React.lazy(() =>
  import('-/pages/examples/threejs/ray-casting')
)
const TriangleStrip = React.lazy(() =>
  import('-/pages/examples/threejs/triangle-strip')
)
const FPSControls = React.lazy(() =>
  import('-/pages/examples/threejs/first-person-controls')
)
const DeviceOrientation = React.lazy(() =>
  import('-/pages/examples/threejs/device-orientation-controls')
)
const MarchingCubes = React.lazy(() =>
  import('-/pages/examples/threejs/marching-cubes')
)
const GpuCompute = React.lazy(() =>
  import('-/pages/examples/threejs/gpu-compute')
)
const SPH = React.lazy(() => import('-/pages/examples/threejs/sph'))
const Winds = React.lazy(() => import('-/pages/examples/advanced/winds'))
const Editor = React.lazy(() => import('-/pages/editor'))

const Snek = React.lazy(() => import('-/pages/examples/threejswebvr/snek'))

const StreamingPano = React.lazy(() =>
  import('-/pages/examples/threejs/streaming-panorama')
)

const Loading = () => (
  <div className="content text ui container">
    <div className="ui active centered inline loader text">Loading</div>
  </div>
)

const lazy = (Component) => (...args) => (
  <Suspense fallback={<Loading />}>
    <Component {...args} />
  </Suspense>
)

const Routes = (Layout) => () => (
  <BrowserRouter>
    <Layout>
      <Route exact path="/" component={Home} />
      <Route path="/examples/basics/00" component={lazy(HelloWorld)} />
      <Route path="/examples/basics/01" component={lazy(Twgljs)} />
      <Route path="/examples/basics/02" component={lazy(Lighting)} />
      <Route path="/examples/basics/03" component={lazy(TexturesAndBlending)} />
      <Route path="/examples/basics/04" component={lazy(LoadingObjects)} />

      <Route path="/examples/threejs/00" component={lazy(HelloThreejs)} />
      <Route path="/examples/threejs/01" component={lazy(PointLight)} />
      <Route path="/examples/threejs/02" component={lazy(VideoTexture)} />
      <Route path="/examples/threejs/03" component={lazy(GameOfLife)} />
      <Route path="/examples/threejs/04" component={lazy(Winds)} />
      <Route path="/examples/threejs/05" component={lazy(DrawingAxes)} />
      <Route path="/examples/threejs/06" component={lazy(RayMarching)} />
      <Route path="/examples/threejs/07" component={lazy(Fractals)} />
      <Route path="/examples/threejs/08" component={lazy(Graphing)} />
      <Route path="/examples/threejs/09" component={lazy(OimoPhysics)} />
      <Route path="/examples/threejs/10" component={lazy(RayCasting)} />
      <Route path="/examples/threejs/11" component={lazy(TriangleStrip)} />
      <Route path="/examples/threejs/12" component={lazy(FPSControls)} />
      <Route path="/examples/threejs/13" component={lazy(DeviceOrientation)} />
      <Route path="/examples/threejs/14" component={lazy(MarchingCubes)} />
      <Route path="/examples/threejs/15" component={lazy(SPH)} />
      <Route path="/examples/threejs/16" component={lazy(GpuCompute)} />
      <Route path="/examples/threejs/17" component={lazy(StreamingPano)} />

      <Route path="/examples/threejswebvr/00" component={lazy(HelloWebVr)} />
      <Route path="/examples/threejswebvr/01" component={lazy(VRInput)} />
      <Route path="/examples/threejswebvr/02" component={lazy(Snek)} />
      <Route path="/examples/threejswebvr/03" component={lazy(ChildWorker)} />

      <Route path="/examples/advanced/00" component={lazy(Winds)} />

      <Route path="/editor" component={lazy(Editor)} />
    </Layout>
  </BrowserRouter>
)

export default Routes
