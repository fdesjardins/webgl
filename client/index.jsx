import Inferno, { render } from 'inferno'
import createBrowserHistory from 'history/createBrowserHistory'
import { BrowserRouter, Route, IndexRoute } from 'inferno-router'

import initialState from '-/state'
import Routes from '-/components/Routes/Routes'
import App from '-/components/App/App'
import Provider from '-/components/Provider/Provider'

const initialize = (store, Routes) => {
  const browserHistory = createBrowserHistory()
  render(
    <BrowserRouter>
      <Routes store={initialState} browserHistory={browserHistory} />
    </BrowserRouter>,
    document.querySelector('#app')
  )
}
initialize(initialState, Routes)
