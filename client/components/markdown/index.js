import React, { createElement } from 'react'
import { Link } from 'react-router-dom'
import marksy from 'marksy/components'
import hljs from 'highlight.js/lib/highlight'
import hljsJavascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/ocean.css'
import { css } from 'emotion'

import Icon from '-/components/icon'

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
