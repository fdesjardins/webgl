import Inferno from 'inferno'
import { Link } from 'inferno-router'
import Component from 'inferno-component'

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
      <div>
        <Link to='/'>Home</Link>
        <h2>{ appCursor.get('message') }</h2>
        <div>{ this.props.children || null }</div>
      </div>
    )
  }
}

export default App
