import Inferno from 'inferno'
import Component from 'inferno-component'

export default class Provider extends Component {
  constructor (props, context) {
    super(props, context)
    this.store = props.store
  }
  componentDidMount () {
    this.store.on('update', () => this.setState())
  }
  render () {
    return this.props.children
  }
  getChildContext () {
    return {
      store: this.props.store
    }
  }
}