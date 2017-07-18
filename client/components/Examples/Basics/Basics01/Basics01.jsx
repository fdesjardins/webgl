import Inferno from 'inferno'

import { default as utils, sq } from '-/utils'
import Markdown from '-/components/Markdown/Markdown'
import notes from './readme.md'

const didMount = () => {}

const Canvas = () => {
  return (
    <canvas id='scene' />
  )
}

const Ex01 = ({ subscribe }) => {
  return (
    <div>
      <Markdown text={ notes } />
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
