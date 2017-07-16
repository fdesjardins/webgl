import Inferno from 'inferno'
import { Router, Route, IndexRoute } from 'inferno-router'

import Provider from '-/components/Provider/Provider'
import App from '-/components/App/App'
import Index from '-/components/Index/Index'
import NotFound from '-/components/NotFound/NotFound'

import Ex01 from '-/components/Examples/Ex01/Ex01'

const Routes = ({ store, browserHistory }) => (
  <Provider store={ store }>
    <Router history={ browserHistory }>
      <Route component={ App }>
        <IndexRoute component={ Index }/>
        <Route path='01' component={ Ex01 }/>
        <Route path='*' component={ NotFound }/>
      </Route>
    </Router>
  </Provider>
)

export default Routes
