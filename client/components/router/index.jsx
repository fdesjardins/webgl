import React from 'react'
import { BrowserRouter, Route, IndexRoute } from 'react-router-dom'

import App from '-/components/app'
import NotFound from '-/components/not-found'

import Home from '-/pages/home'
import HelloWorld from '-/pages/examples/basics/hello-world'
import Twgljs from '-/pages/examples/basics/twgljs'
import Lighting from '-/pages/examples/basics/lighting'
import TexturesAndBlending from '-/pages/examples/basics/textures-and-blending'
import LoadingObjects from '-/pages/examples/basics/loading-objects'
import HelloThreejs from '-/pages/examples/threejs/hello-threejs'
import PointLight from '-/pages/examples/threejs/point-light'
import Winds from '-/pages/examples/advanced/winds'

const Routes = ({ store }) => (
  <BrowserRouter>
    <App onEnter={ App.registerRouter }>
      <Route exact path="/" component={ Home } />
      <Route path="/examples/basics/00" component={ HelloWorld } />
      <Route path="/examples/basics/01" component={ Twgljs } />
      <Route path="/examples/basics/02" component={ Lighting } />
      <Route path="/examples/basics/03" component={ TexturesAndBlending } />
      <Route path="/examples/basics/04" component={ LoadingObjects } />
      <Route path="/examples/threejs/00" component={ HelloThreejs } />
      <Route path="/examples/threejs/01" component={ PointLight } />
      <Route path="/examples/advanced/00" component={ Winds } />
    </App>
  </BrowserRouter>
)
export default Routes
