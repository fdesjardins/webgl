import React from 'react'
import { Link } from 'react-router-dom'

const MenuItem = ({ type, num, title }) => (
  <li>
    <Link to={`/examples/${type}/${num}`}>
      {num} - {title}
    </Link>
  </li>
)

const Menu = () => (
  <ul>
    <h3>Getting Started</h3>
    <MenuItem type="basics" num="00" title="Hello World" />
    <MenuItem type="basics" num="01" title="Twgl.js" />
    <MenuItem type="basics" num="02" title="Lighting" />
    <MenuItem type="basics" num="03" title="Textures and Blending" />
    <MenuItem type="basics" num="04" title="Loading Objects" />

    <h3>Three.js</h3>
    <MenuItem type="threejs" num="00" title="Hello three.js" />
    <MenuItem type="threejs" num="01" title="Point Light" />
    <MenuItem type="threejs" num="02" title="Video Texture" />
    <MenuItem type="threejs" num="03" title="Game of Life Texture" />
    <MenuItem type="threejs" num="04" title="Winds Vizualization" />
    <MenuItem type="threejs" num="05" title="Drawing Axes" />
    <MenuItem type="threejs" num="06" title="Ray Marching" />
    <MenuItem type="threejs" num="07" title="Fractals" />
    <MenuItem type="threejs" num="08" title="Graphing" />
    <MenuItem type="threejs" num="09" title="Oimo Physics" />
    <MenuItem type="threejs" num="10" title="Ray Casting" />
    <MenuItem type="threejs" num="11" title="Triangle Strip" />
    <MenuItem type="threejs" num="12" title="FPS" />
    <MenuItem type="threejs" num="13" title="DeviceOrientation" />
    <MenuItem type="threejs" num="14" title="Metaballs and Marching Cubes" />
    <MenuItem type="threejs" num="15" title="Smoothed-Particle Hydrodynamics" />
    <MenuItem type="threejs" num="16" title="GPU Compute" />

    <br />
    <h3>Three.js WebVR</h3>
    <MenuItem type="threejswebvr" num="00" title="Hello WebVR" />
    <MenuItem type="threejswebvr" num="01" title="VR input" />
    <MenuItem type="threejswebvr" num="02" title="Snek" />
    <MenuItem type="threejswebvr" num="03" title="Workers" />
    <MenuItem type="threejswebvr" num="04" title="p2p" />

    <br />
    <h3>Other Cool Stuff</h3>
    <Link to="/editor">Editor</Link>

    <br />
    <li>Stencil Testing</li>
    <li>Framebuffers</li>
    <li>Cubemaps</li>
    <li>Instancing</li>
    <li>Deferred Shading</li>
    <li>SSAO</li>
    <li>Summed-Area Variance Shadow Maps</li>
    <li>Motion Blur</li>
    <li>Fluid Simulation</li>
    <li>Matrix Multiplication</li>
    <li>Particle Systems</li>
    <li>Gravity</li>
    <li>N-body Simulation</li>
    <li>A material point method for snow simulation</li>
    <li>Heat Equation</li>
  </ul>
)

export default React.memo(Menu)
