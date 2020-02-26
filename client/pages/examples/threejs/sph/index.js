import React from 'react'
import { css } from 'emotion'
import Baobab from 'baobab'

import { wrapComponent } from '-/utils'
import Example from '-/components/example'
import notes from './readme.md'
import SPH from './sph'
import {
  ToggleGrid,
  ToggleSurface,
  ToggleParticles,
  Viscosity,
  TimeStep,
  SurfaceResolution
} from './elements'

const state = new Baobab({
  showGrid: false,
  showSurface: true,
  showParticles: true,
  viscosity: 30,
  timestep: 0.02,
  surfaceResolution: 24
})

const style = css`
  canvas {
    max-width: 100%;
    border: 1px solid #eee;
  }
  .input {
    margin-right: 10px;
  }
`

const E = () => (
  <div className={`${style}`}>
    <TimeStep
      get={() => state.get('timestep')}
      set={val => state.set('timestep', val)}
    />
    <Viscosity
      get={() => state.get('viscosity')}
      set={val => state.set('viscosity', val)}
    />
    <SurfaceResolution
      get={() => state.get('surfaceResolution')}
      set={val => state.set('surfaceResolution', val)}
    />
    <br />
    <br />
    <ToggleGrid
      getShowGrid={() => state.get('showGrid')}
      setShowGrid={val => state.set('showGrid', val)}
    />
    <ToggleSurface
      getShowSurface={() => state.get('showSurface')}
      setShowSurface={val => state.set('showSurface', val)}
    />
    <ToggleParticles
      get={() => state.get('showParticles')}
      set={val => state.set('showParticles', val)}
    />
    <br />
    <br />
    <Example
      notes={notes}
      components={{
        SPH: wrapComponent(SPH, { state })
      }}
    />
  </div>
)

export default E
