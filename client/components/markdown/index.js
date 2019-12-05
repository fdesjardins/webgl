import React, { createElement } from 'react'
import { Link } from 'react-router-dom'
import marksy from 'marksy/components'
import hljs from 'highlight.js/lib/highlight'
import hljsJavascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/ocean.css'
import { css } from 'emotion'
import MDX from '@mdx-js/runtime'
import Icon from '-/components/icon'

import mdit from 'markdown-it'
import jsx from 'markdown-it-jsx'
import math from 'markdown-it-math'

const md = mdit()
  .use(math)
  .use(jsx)

hljs.registerLanguage('javascript', hljsJavascript)

const standardComponents = {
  Link: ({ children, context, ...rest }) => <Link {...rest}>{children}</Link>,
  Icon: ({ children, context, ...rest }) => <Icon {...rest}>{children}</Icon>
}

const style = css`
  margin-bottom: 25px;

  i.em {
    font-size: 125%;
    margin: 0 2px;
  }

  blockquote {
    color: #777;
    font-size: 100%;
  }

  pre {
    background-color: #2b303b;
    color: #d0d5de;
    padding: 15px;
    font-size: 80%;
  }
`

export default ({ text, components }) => {
  const compile = marksy({
    createElement,
    components: {
      ...components,
      ...standardComponents
    },
    highlight: (language, code) => hljs.highlight(language, code).value
  })
  return <div className={`marksy ${style}`}>{compile(text).tree}</div>
}

// // Provide custom components for markdown elements
// const components = {
//   h1: props => <h1 style={{ color: 'tomato' }} {...props} />
// }
// // Provide custom components that will be referenced as JSX
// // in the markdown string
// const scope = {
//   Demo: props => <h1>This is a demo component</h1>
// }
// const mdx = `
// # Hello, world!
//
// <canvas id="canvas"/>
// `
// export default ({ text, components }) => {
//   return <div dangerouslySetInnerHTML={{ __html: md.render(text) }} />
// }
