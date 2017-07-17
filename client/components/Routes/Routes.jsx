import Inferno from 'inferno'
import { Router, Route, IndexRoute } from 'inferno-router'

import Provider from '-/components/Provider/Provider'
import App from '-/components/App/App'
import Index from '-/components/Index/Index'
import NotFound from '-/components/NotFound/NotFound'

import Ex01 from '-/components/Examples/Ex01/Ex01'
import Ex02 from '-/components/Examples/Ex02/Ex02'
import Ex03 from '-/components/Examples/Ex03/Ex03'
import Ex04 from '-/components/Examples/Ex04/Ex04'

import Threejs01 from '-/components/Threejs/Threejs01/Threejs01'

const Routes = ({ store, browserHistory }) => (
  <Provider store={ store }>
    <Router history={ browserHistory }>
      <Route component={ App }>
        <IndexRoute component={ Index }/>

        <Route path='01' component={ Ex01 }/>
        <Route path='02' component={ Ex02 }/>
        <Route path='03' component={ Ex03 }/>
        <Route path='04' component={ Ex04 }/>

        <Route path='Threejs01' component={ Threejs01 }/>

        <Route path='*' component={ NotFound }/>
      </Route>
    </Router>
  </Provider>
)

export default Routes
