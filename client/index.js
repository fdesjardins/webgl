import Inferno from 'inferno'
import createBrowserHistory from 'history/createBrowserHistory'

import initialState from '-/state'
import Routes from '-/components/Routes/Routes'

const initialize = (store, Routes) => {
  const browserHistory = createBrowserHistory()
  Inferno.render(
    <Routes store={ store } browserHistory={ browserHistory } />,
    document.querySelector('#app')
  )
}

initialize(initialState, Routes)
