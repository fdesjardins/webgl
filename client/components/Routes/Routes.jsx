import Inferno from 'inferno'
import { BrowserRouter, Route, IndexRoute } from 'inferno-router'

import Provider from '-/components/Provider/Provider'
import App from '-/components/App/App'
import Index from '-/components/Index/Index'
import NotFound from '-/components/NotFound/NotFound'

import Basics01 from '-/components/Examples/Basics/Basics01/Basics01'
import Basics02 from '-/components/Examples/Basics/Basics02/Basics02'
import Basics03 from '-/components/Examples/Basics/Basics03/Basics03'
import Basics04 from '-/components/Examples/Basics/Basics04/Basics04'
import Basics05 from '-/components/Examples/Basics/Basics05/Basics05'
import Basics06 from '-/components/Examples/Basics/Basics06/Basics06'
import Basics07 from '-/components/Examples/Basics/Basics07/Basics07'

import Threejs01 from '-/components/Examples/Threejs/Threejs01/Threejs01'
import Threejs02 from '-/components/Examples/Threejs/Threejs02/Threejs02'
import Threejs03 from '-/components/Examples/Threejs/Threejs03/Threejs03'

import Gpujs01 from '-/components/Examples/Gpujs/Gpujs01/Gpujs01'

const Routes = ({ store }) => (
  <BrowserRouter>
    <Provider store={store}>
      <App onEnter={App.registerRouter}>
        <Route exact path="/" component={Index} />
        <Route path="/basics/01" component={Basics01} />
        <Route path="/basics/02" component={Basics02} />
        <Route path="/basics/03" component={Basics03} />
        <Route path="/basics/04" component={Basics04} />
        <Route path="/basics/05" component={Basics05} />
        <Route path="/basics/06" component={Basics06} />
        <Route path="/basics/07" component={Basics07} />
        <Route path="/threejs/01" component={Threejs01} />
        <Route path="/threejs/02" component={Threejs02} />
        <Route path="/threejs/03" component={Threejs03} />
        <Route path="/gpujs/01" component={Gpujs01} />
      </App>
    </Provider>
  </BrowserRouter>
)
export default Routes
