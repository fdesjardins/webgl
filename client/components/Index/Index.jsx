import Inferno from 'inferno'
import { Link } from 'inferno-router'

import './Index.scss'

const Index = () => {
  return (
    <ul class='index'>

      <li class='section'>
        <span class='title'>Basics</span>
        <ul>
          <li><Link to='/basics/01'>Hello World</Link></li>
          <li><Link to='/basics/02'>Hello 2D World</Link></li>
          <li><Link to='/basics/03'>Hello 3D World</Link></li>
          <li><Link to='/basics/04'>twgl.js</Link></li>
          <li><Link to='/basics/05'>Lighting</Link></li>
          <li><Link to='/basics/06'>Textures and Blending</Link></li>
          <li>JSON Objects</li>
          <li>Mouse Events</li>
          <li>Shadows</li>
          <li>Geometry Shaders</li>
        </ul>
      </li>

      <li class='section'>
        <span class='title'>Advanced WebGL</span>
        <ul>
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
        </ul>
      </li>

      <li class='section'>
        <span class='title'>Three.js</span>
        <ul>
          <li><Link to='/threejs/01'>Hello three.js</Link></li>
          <li><Link to='/threejs/02'>Point Light</Link></li>
          <li><Link to='/threejs/03'>Physics</Link></li>
          <li>...</li>
          <li>particle systems</li>
        </ul>
      </li>

      <li class='section'>
        <span class='title'>gpu.js</span>
        <ul>
          <li><Link to='/gpujs/01'>Matrix Multiplication</Link></li>
          <li>...</li>
          <li>N-body Simulation</li>
        </ul>
      </li>

      <li class='section'>
        <span class='title'>Oimo.js</span>
        <ul>
          <li>Gravity</li>
          <li>...</li>
          <li></li>
        </ul>
      </li>

      <li class='section'>
        <span class='title'>Reimplemented Papers</span>
        <ul>
          <li>A material point method for snow simulation</li>
          <li>...</li>
          <li></li>
        </ul>
      </li>

      <li class='section'>
        <span class='title'>Numerical Methods</span>
        <ul>
          <li>Heat Equation</li>
          <li>...</li>
          <li></li>
        </ul>
      </li>
    </ul>
  )
}

export default Index
