import React from 'react'
import { Link } from 'react-router-dom'

import './home.scss'

const Links = () => (
  <ul>
    <li>
      <Link to="/examples/basics/00">0.00 - Hello World</Link>
    </li>
    <li>
      <Link to="/examples/basics/01">0.01 - Twgl.js</Link>
    </li>
    <li>
      <Link to="/examples/basics/02">0.02 - Lighting</Link>
    </li>
    <li>
      <Link to="/examples/basics/03">0.03 - Textures and Blending</Link>
    </li>
    <li>
      <Link to="/examples/basics/04">0.04 - Loading Objects</Link>
    </li>
    <li>Mouse Events</li>
    <li>Shadows</li>
    <li>Geometry Shaders</li>
    <li>Stencil Testing</li>
    <li>Blending</li>
    <li>Framebuffers</li>
    <li>Cubemaps</li>
    <li>Instancing</li>
    <li>Deferred Shading</li>
    <li>SSAO</li>
    <li>Metaballs</li>
    <li>Summed-Area Variance Shadow Maps</li>
    <li>Motion Blur</li>
    <li>Fluid Simulation</li>
    <li>
      <Link to="/examples/threejs/00">1.00 - Hello three.js</Link>
    </li>
    <li>
      <Link to="/examples/threejs/01">1.01 - Point Light</Link>
    </li>
    <li>
      <Link to="/examples/advanced/00">2.00 - Winds Visualization</Link>
    </li>
    <li>Matrix Multiplication</li>
    <li>Particle Systems</li>
    <li>Gravity</li>
    <li>N-body Simulation</li>
    <li>Oimo.js</li>
    <li>A material point method for snow simulation</li>
    <li>Heat Equation</li>
  </ul>
)

const Index = () => {
  return (
    <ul className="index">
      <label>All Examples</label>
      <Links />
    </ul>
  )
}

export default Index
