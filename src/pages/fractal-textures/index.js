import { GUI } from 'dat.gui'

import mandelbrot from './mandelbrot.fs.glsl'
import julia from './julia.fs.glsl'

export const meta = {
  tags: 'threejs',
  title: 'Fractal Textures',
  slug: 'fractals',
}

export const options = {
  display: 'fullscreen',
  type: 'shadertoy',
  shadertoy: {
    fs: mandelbrot,
  },
}

export const init = ({ canvas, container, mesh }) => {
  const gui = new GUI()
  const fractalFolder = gui.addFolder('Fractals')
  fractalFolder.open()

  const api = {
    fractal: 'mandelbrot',
  }
  const settings = {
    fractals: ['mandelbrot', 'julia'],
  }
  const fractalsCtrl = fractalFolder.add(api, 'fractal').options(settings.fractals)
  fractalsCtrl.onChange(() => {
    if (api.fractal === 'mandelbrot') {
      mesh.material.fragmentShader = mandelbrot
    } else if (api.fractal === 'julia') {
      mesh.material.fragmentShader = julia
    }
    mesh.material.needsUpdate = true
  })

  return () => {
    gui.destroy()
  }
}
