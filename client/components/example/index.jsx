import Inferno from 'inferno'

import Markdown from '-/components/markdown'
import './Example.scss'

const Example = ({ notes, components }) => {
  return (
    <div class="example">
      <Markdown text={notes} components={components} />
    </div>
  )
}

export default Example
