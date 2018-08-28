import Inferno from 'inferno'
import { Link } from 'inferno-router'
import { createElement } from 'inferno-create-element'
import marksy from 'marksy/components'
import hljs from 'highlight.js/lib/highlight'
import hljsJavascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/ocean.css'

import Icon from '-/components/icon'
import './Markdown.scss'

hljs.registerLanguage('javascript', hljsJavascript)

const standardComponents = {
  Link: ({ children, context, ...rest }) => <Link { ...rest }>{children}</Link>,
  Icon: ({ children, context, ...rest }) => <Icon { ...rest }>{children}</Icon>
}

export default ({ text, components }) => {
  const compile = marksy({
    createElement,
    components: {
      ...components,
      ...standardComponents
    },
    highlight: (language, code) => hljs.highlight(language, code).value
  })
  return <div class="marksy markdown">{compile(text).tree}</div>
}
