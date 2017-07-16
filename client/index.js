import Baobab from 'baobab'
import Inferno from 'inferno'

import App from '-/components/App/App'
import initialState from '-/state'

const initialize = (tree, App) => {
  const render = () => Inferno.render(<App tree={ tree }/>, document.querySelector('#app'))
  tree.on('update', render)
  render()
}

initialize(initialState, App)
