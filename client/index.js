import Baobab from 'baobab'
import Inferno from 'inferno'
import { Router, Route, IndexRoute } from 'inferno-router'
import createBrowserHistory from 'history/createBrowserHistory'

import App from '-/components/App/App'
import Index from '-/components/Index/Index'
import Ex01 from '-/components/Ex01/Ex01'
import NotFound from '-/components/NotFound/NotFound'
import initialState from '-/state'

const browserHistory = createBrowserHistory()

const routes = (
  <Router history={ browserHistory }>
    <Route component={ App }>
      <IndexRoute component={ Index }/>
      <Route path='01' component={ Ex01 }/>
      <Route path='*' component={ NotFound }/>
    </Route>
  </Router>
)

const initialize = (tree, App) => {
  const render = () => Inferno.render(routes, document.querySelector('#app'))
  tree.on('update', render)
  render()
}

initialize(initialState, App)
