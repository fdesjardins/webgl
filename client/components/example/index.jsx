import React from 'react'

import Markdown from '-/components/markdown'
import './Example.scss'

const Example = ({ notes, components }) => {
  return (
    <div className="example">
      <Markdown text={ notes } components={ components } />
    </div>
  )
}

export default Example
