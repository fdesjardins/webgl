import Inferno from 'inferno'
import MarkdownIt from 'markdown-it'
import dompurify from 'dompurify'

const md = new MarkdownIt()

export default ({ text }) => {
  return <div class='notes' dangerouslySetInnerHTML={ { __html: dompurify.sanitize(md.render(text)) } } />
}
