import Inferno from 'inferno'
import { Link } from 'inferno-router'

import './Index.scss'

const Index = () => {
  return (
    <ul class='index'>

      <li class='section'>
        <span class='title'>Basics</span>
        <ul>
          <li><Link to='/01'>hello world</Link></li>
          <li><Link to='/02'>hello 2d world</Link></li>
          <li><Link to='/03'>hello 3d world</Link></li>
          <li><Link to='/04'>twgl.js</Link></li>
          <li>lighting</li>
          <li>objects and textures</li>
          <li>custom shaders</li>
          <li>scene graphs</li>
        </ul>
      </li>

      <li class='section'>
        <span class='title'>Advanced WebGL</span>
        <ul>
          <li>shadows</li>
          <li>stencil testing</li>
          <li>blending</li>
          <li>framebuffers</li>
          <li>cubemaps</li>
          <li>geometry shaders</li>
        </ul>
      </li>

      <li class='section'>
        <span class='title'>Three.js</span>
        <ul>
          <li><Link to='/Threejs01'>hello three.js</Link></li>
          <li>...</li>
          <li>particle systems</li>
        </ul>
      </li>

      <li class='section'>
        <span class='title'>Using gpu.js</span>
        <ul>
          <li>matrix multiplication</li>
          <li>...</li>
          <li>n-body sim</li>
        </ul>
      </li>
    </ul>
  )
}

export default Index
