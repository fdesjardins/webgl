import Inferno from 'inferno'

import { default as utils, sq } from '-/utils'

const didMount = () => {}

const Canvas = () => {
  return (
    <canvas id='scene' />
  )
}

const Ex01 = ({ subscribe }) => {
  return (
    <div>
      <Canvas onComponentDidMount={ didMount(subscribe) }/>
    </div>
  )
}

export default ({ children }, { store }) => {
  const subscribe = callback => {
    store.select(sq('ex1.scene')).on('update', ({ data }) => callback(data.currentData))
  }
  return (
    <Ex01
      subscribe={ subscribe }
      onComponentShouldUpdate={ utils.shouldUpdate }
    />
  )
}