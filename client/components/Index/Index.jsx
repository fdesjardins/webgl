import Inferno from 'inferno'
import { Link } from 'inferno-router'

const Index = () => {
  return (
    <ul>
      <li><Link to='/01'>01_hello-world</Link></li>
      <li><Link to='/02'>02_hello-2d-world</Link></li>
      <li><Link to='/03'>03_hello-3d-world</Link></li>
    </ul>
  )
}

export default Index
