import Inferno, { Component } from 'inferno'
import { Link } from 'inferno-router'

import CommandPalette from '-/components/controls/command-palette'

import './App.scss'

class App extends Component {
  constructor(props, context) {
    super(props, context)
    this.store = context.store
  }
  componentDidMount() {
    this.store.on('update', () => this.setState())
  }
  render() {
    const appCursor = this.store.select('app')
    return (
      <div class="app">
        <nav class="nav">
          <Link to="/">Home</Link>
        </nav>
        {/* <span class='flash-message'>
          { appCursor.get('message') }
        </span> */}
        <div class="content">{this.props.children || null}</div>
        <CommandPalette />
      </div>
    )
  }
  registerRouter(props, router) {
    this.router = router
  }
}

export default App
