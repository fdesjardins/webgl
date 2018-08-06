import Inferno from 'inferno'
import { createElement } from 'inferno-create-element'
import marksy from 'marksy/components'
import hljs from 'highlight.js/lib/highlight'
import hljsJavascript from 'highlight.js/lib/languages/javascript'

import 'highlight.js/styles/ocean.css'
import './Markdown.scss'

hljs.registerLanguage('javascript', hljsJavascript)

export default ({ text, components }) => {
  const compile = marksy({
    createElement,
    components,
    highlight: (language, code) => hljs.highlight(language, code).value
  })
  return (
    <div class='marksy markdown'>{ compile(text).tree }</div>
  )
}
