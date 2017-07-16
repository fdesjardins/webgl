import Inferno from 'inferno'
import { Link } from 'inferno-router'

const App = ({ children }) => {
  return (
    <div>
      <Link to='/'>Home</Link>
      <div>{ children }</div>
    </div>
  )
}

export default App
