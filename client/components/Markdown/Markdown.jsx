import Inferno from 'inferno'
import createElement from 'inferno-create-element'
import marksy from 'marksy/components'
import hljs from 'highlight.js/lib/highlight'
import hljsJavascript from 'highlight.js/lib/languages/javascript'

import './Markdown.scss'

hljs.registerLanguage('javascript', hljsJavascript)

export default ({ text, components }) => {
  const compile = marksy({
    createElement,
    components
  })
  return (
    <div class='marksy markdown'>{ compile(text).tree }</div>
  )
}
