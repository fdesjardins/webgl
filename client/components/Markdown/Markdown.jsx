import Inferno from 'inferno'
import MarkdownIt from 'markdown-it'
import dompurify from 'dompurify'
import markdownItLatex from 'markdown-it-latex'

const md = new MarkdownIt()
md.use(markdownItLatex)

import './Markdown.scss'

export default ({ text }) => {
  return <div class='markdown' dangerouslySetInnerHTML={ { __html: dompurify.sanitize(md.render(text)) } } />
}