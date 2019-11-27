import React from 'react'

const fractals = ['mandelbrot', 'julia']

export const FractalPicker = ({ fractal, setFractal }) => (
  <select
    value={fractal}
    className="ui dropdown"
    onChange={({ target }) => setFractal(target.value)}
  >
    {fractals.map(f => (
      <option key={f} value={f}>
        {f}
      </option>
    ))}
  </select>
)

export default FractalPicker
