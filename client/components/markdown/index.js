import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { css } from 'emotion'
import MDX from '@mdx-js/runtime'
import { MDXProvider } from '@mdx-js/react'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkSlug from 'remark-slug'
import remarkAutolinkHeadings from 'remark-autolink-headings'
import remarkTableOfContents from 'remark-toc'

import Icon from '-/components/icon'

const LinkComponent = ({ children, context, ...rest }) => <Link {...rest}>{children}</Link>
LinkComponent.propTypes = {
  children: PropTypes.node,
  context: PropTypes.object
}

const IconComponent = ({ children, context, ...rest }) => <Icon {...rest}>{children}</Icon>
IconComponent.propTypes = {
  children: PropTypes.object,
  context: PropTypes.object
}

const standardComponents = {
  Link: LinkComponent,
  Icon: IconComponent
}

const style = css`
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

  h1,h2,h3,h4,h5,h6 {
    > a {
      color: #444;
    }
    ::before {
      pointer-events: none;
      display: block;
      content: " ";
      margin-top: -3.5em;
      height: 3.5em;
      visibility: hidden;
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
                behavior: 'wrap'
              }
            ]
          ]}
          rehypePlugins={[rehypeKatex]}
        >
          {text}
        </MDX>
      </MDXProvider>
    </div>
  )
}

Markdown.propTypes = {
  text: PropTypes.string,
  components: PropTypes.object
}

export default Markdown
