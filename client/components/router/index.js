import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

import Home from '-/pages/home'
import HelloWorld from '-/pages/examples/basics/hello-world'
import Twgljs from '-/pages/examples/basics/twgljs'
import Lighting from '-/pages/examples/basics/lighting'
import TexturesAndBlending from '-/pages/examples/basics/textures-and-blending'
import LoadingObjects from '-/pages/examples/basics/loading-objects'
import HelloThreejs from '-/pages/examples/threejs/hello-threejs'
import PointLight from '-/pages/examples/threejs/point-light'
import GameOfLife from '-/pages/examples/threejs/game-of-life'
import VideoTexture from '-/pages/examples/threejs/video-texture'
import DrawingAxes from '-/pages/examples/threejs/drawing-axes'
import RayMarching from '-/pages/examples/threejs/ray-marching'
import HelloWebVr from '-/pages/examples/threejswebvr/hello-threejswebvr'
import VRInput from '-/pages/examples/threejswebvr/vr-input'
import Snek from '-/pages/examples/threejswebvr/snek'
import ChildWorker from '-/pages/examples/threejswebvr/worker'
import Fractals from '-/pages/examples/threejs/fractals'
import Graphing from '-/pages/examples/threejs/graphing'
import OimoPhysics from '-/pages/examples/threejs/oimophysics'
import RayCasting from '-/pages/examples/threejs/ray-casting'
import TriangleStrip from '-/pages/examples/threejs/triangle-strip'
import FPSControls from '-/pages/examples/threejs/first-person-controls'
import DeviceOrientation from '-/pages/examples/threejs/device-orientation-controls'
import MarchingCubes from '-/pages/examples/threejs/marching-cubes'
import GpuCompute from '-/pages/examples/threejs/gpu-compute'
import SPH from '-/pages/examples/threejs/sph'
import Winds from '-/pages/examples/advanced/winds'
import Editor from '-/pages/editor'

const Routes = (Layout) => ({ store }) => (
  <BrowserRouter>
    <Layout>
      <Route exact path="/" component={Home} />
      <Route path="/examples/basics/00" component={HelloWorld} />
      <Route path="/examples/basics/01" component={Twgljs} />
      <Route path="/examples/basics/02" component={Lighting} />
      <Route path="/examples/basics/03" component={TexturesAndBlending} />
      <Route path="/examples/basics/04" component={LoadingObjects} />

      <Route path="/examples/threejs/00" component={HelloThreejs} />
      <Route path="/examples/threejs/01" component={PointLight} />
      <Route path="/examples/threejs/02" component={VideoTexture} />
      <Route path="/examples/threejs/03" component={GameOfLife} />
      <Route path="/examples/threejs/04" component={Winds} />
      <Route path="/examples/threejs/05" component={DrawingAxes} />
      <Route path="/examples/threejs/06" component={RayMarching} />
      <Route path="/examples/threejs/07" component={Fractals} />
      <Route path="/examples/threejs/08" component={Graphing} />
      <Route path="/examples/threejs/09" component={OimoPhysics} />
      <Route path="/examples/threejs/10" component={RayCasting} />
      <Route path="/examples/threejs/11" component={TriangleStrip} />
      <Route path="/examples/threejs/12" component={FPSControls} />
      <Route path="/examples/threejs/13" component={DeviceOrientation} />
      <Route path="/examples/threejs/14" component={MarchingCubes} />
      <Route path="/examples/threejs/15" component={SPH} />
      <Route path="/examples/threejs/16" component={GpuCompute} />

      <Route path="/examples/threejswebvr/00" component={HelloWebVr} />
      <Route path="/examples/threejswebvr/01" component={VRInput} />
      <Route path="/examples/threejswebvr/02" component={Snek} />
      <Route path="/examples/threejswebvr/03" component={ChildWorker} />

      <Route path="/examples/advanced/00" component={Winds} />

      <Route path="/editor" component={Editor} />
    </Layout>
  </BrowserRouter>
)

export default Routes
