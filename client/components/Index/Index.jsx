import Inferno from 'inferno'
import { Link } from 'inferno-router'

const Index = () => {
  return (
    <ul>
      <li>
        <h2>Basics</h2>
        <ul>
          <li><Link to='/01'>hello world</Link></li>
          <li><Link to='/02'>hello 2d world</Link></li>
          <li><Link to='/03'>hello 3d world</Link></li>
          <li>lighting</li>
          <li>objects and textures</li>
          <li>custom shaders</li>
          <li>scene graphs</li>
        </ul>
      </li>
      <li>
        <h2>Advanced WebGL</h2>
        <ul>
          <li>shadows</li>
          <li>stencil testing</li>
          <li>blending</li>
          <li>framebuffers</li>
          <li>cubemaps</li>
          <li>geometry shaders</li>
        </ul>
      </li>
      <li>
        <h2>Using gpu.js</h2>
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
