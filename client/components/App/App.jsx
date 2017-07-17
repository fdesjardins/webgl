import Inferno from 'inferno'
import { Link } from 'inferno-router'
import Component from 'inferno-component'

import './App.scss'

class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.store = context.store
  }
  componentDidMount () {
    this.store.on('update', () => this.setState())
  }
  render () {
    const appCursor = this.store.select('app')
    return (
      <div class='app'>

        <nav class='nav'>
          <Link to='/'>Home</Link>
        </nav>

        {/* <span class='flash-message'>
          { appCursor.get('message') }
        </span> */}

        <div class='content'>
          { this.props.children || null }
        </div>
      </div>
    )
  }
}

export default App
