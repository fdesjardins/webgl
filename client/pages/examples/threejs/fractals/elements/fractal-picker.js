import React from 'react'

const fractals = ['mandelbrot']

export const FractalPicker = ({ fractal, setOption }) => (
  <div className="ui input">
    <select>
      {fractals.map(f => (
        <option key={f} value={f}>
          {f}
        </option>
      ))}
    </select>
  </div>
)

export default FractalPicker
