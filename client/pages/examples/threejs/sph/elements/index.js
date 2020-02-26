import React from 'react'

const shapes = ['plane', 'sphere', 'cylinder', 'torus knot']

export const ShapePicker = ({ shape, setShape }) => (
  <select
    value={shape}
    className="ui dropdown"
    onChange={({ target }) => setShape(target.value)}
  >
    {shapes.map(f => (
      <option key={f} value={f}>
        {f}
      </option>
    ))}
  </select>
)

export const ToggleGrid = ({ getShowGrid, setShowGrid }) => (
  <button
    className="ui button"
    onClick={() => {
      setShowGrid(!getShowGrid())
    }}
  >
    Toggle Grid
  </button>
)

export const ToggleSurface = ({ getShowSurface, setShowSurface }) => (
  <button
    className="ui button"
    onClick={() => {
      setShowSurface(!getShowSurface())
    }}
  >
    Toggle Surface
  </button>
)

export const ToggleParticles = ({ get, set }) => (
  <button
    className="ui button"
    onClick={() => {
      set(!get())
    }}
  >
    Toggle Particles
  </button>
)

export const Viscosity = ({ get, set }) => (
  <div className="ui labeled input">
    <div className="ui label">Viscosity</div>
    <input
      type="number"
      defaultValue={get()}
      step="1"
      min="15"
      max="30"
      onChange={({ target }) => set(parseFloat(target.value))}
    />
  </div>
)

export const TimeStep = ({ get, set }) => (
  <div className="ui labeled input">
    <div className="ui label">Time Step</div>
    <input
      type="number"
      defaultValue={get()}
      step="0.001"
      min="0.01"
      max="0.1"
      onChange={({ target }) => set(parseFloat(target.value))}
    />
  </div>
)

export const SurfaceResolution = ({ get, set }) => (
  <div className="ui labeled input">
    <div className="ui label">Surface Resolution</div>
    <input
      type="number"
      defaultValue={get()}
      step="1"
      min="15"
      max="36"
      onChange={({ target }) => set(parseFloat(target.value))}
    />
  </div>
)
