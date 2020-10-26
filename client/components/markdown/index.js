import React from 'react'
import { Link } from 'react-router-dom'
import 'highlight.js/styles/ocean.css'
import { css } from 'emotion'
import MDX from '@mdx-js/runtime'
import { MDXProvider } from '@mdx-js/react'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkSlug from 'remark-slug'
import remarkAutolinkHeadings from 'remark-autolink-headings'
import remarkTableOfContents from 'remark-toc'

import Icon from '-/components/icon'

const standardComponents = {
  Link: ({ children, context, ...rest }) => <Link {...rest}>{children}</Link>,
  Icon: ({ children, context, ...rest }) => <Icon {...rest}>{children}</Icon>,
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

  i.icon.linkify {
    margin-left: -1em;
    font-size: 0.75em;
    color: #eee;
    &:hover {
      color: #bbb;
    }
  }
`

const Markdown = ({ text, components }) => {
  return (
    <div className={`${style}`}>
      <MDXProvider components={{ ...components, ...standardComponents }}>
        <MDX
          remarkPlugins={[
            remarkMath,
            remarkSlug,
            remarkTableOfContents,
            [
              remarkAutolinkHeadings,
              {
                content: {
                  type: 'element',
                  tagName: 'i',
                  properties: { className: ['icon', 'linkify'] },
                },
              },
            ],
          ]}
          rehypePlugins={[rehypeKatex]}
        >
          {text}
        </MDX>
      </MDXProvider>
    </div>
  )
}

export default Markdown
