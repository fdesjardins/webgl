import { hot } from 'react-hot-loader/root'
import React from 'react'
import { render } from 'react-dom'
import App from './components/app'

const HotApp = hot(App)
const root = document.getElementById('app')

render(<HotApp />, root)
