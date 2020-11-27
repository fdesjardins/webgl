import React from 'react'
import PT from 'prop-types'
import { Link } from 'react-router-dom'
import { css } from 'emotion'

import examplesIndex from '-/examples-index'

const Tags = ({ tags, setFilter }) => {
  return (
    <>
      {tags.split(',').map((tag) => (
        <div key={tag} className={`${tag} tag`} onClick={() => setFilter(tag)}>
          {tag}
        </div>
      ))}
    </>
  )
}

const menuItemStyle = css`
  font-size: 1em;
  margin-bottom: 0.4em;
  display: flex !important;

  .tag {
    font-size: 0.65em;
    color: #888;
    background-color: #eee;
    padding: 0px 5px;
    border: 1px solid #bbb;
    border-radius: 5px;
    margin-left: 1em;
    cursor: pointer;
  }
  .tag.threejs {
    background-color: #ddeeff;
    border-color: #bbccff;
  }
  .tag.webvr {
    background-color: #ffe6e6;
    border-color: #ddc6c6;
  }
  .tag.gpgpu {
    background-color: #e6ffe6;
    border-color: #c6ddc6;
  }
`

const MenuItem = ({ title, to, tags, setFilter }) => (
  <div className={`item ${menuItemStyle}`}>
    <Link to={`/examples/${to}`}>{title}</Link>
    <Tags tags={tags} setFilter={setFilter} />
  </div>
)
MenuItem.propTypes = {
  title: PT.string,
  to: PT.string,
  tags: PT.string,
}

const Menu = () => {
  const [filter, setFilter] = React.useState('')

  const examples = examplesIndex.filter(
    (x) =>
      x.title.toLowerCase().match(new RegExp(filter.toLowerCase())) ||
      x.tags.toLowerCase().match(new RegExp(filter.toLowerCase()))
  )

  return (
    <>
      <div className="ui input fluid transparent small">
        <input
          type="text"
          placeholder="Search..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </div>
      <div className="ui list">
        {examples.map(({ title, slug, tags }) => {
          return (
            <MenuItem
              key={slug}
              title={title}
              to={slug}
              tags={tags}
              setFilter={setFilter}
            />
          )
        })}
      </div>
    </>
  )
}

// <br />
// <h3>Other Cool Stuff</h3>
// <Link to="/editor">Editor</Link>
//
// <br />
// <li>Stencil Testing</li>
// <li>Framebuffers</li>
// <li>Cubemaps</li>
// <li>Instancing</li>
// <li>Deferred Shading</li>
// <li>SSAO</li>
// <li>Summed-Area Variance Shadow Maps</li>
// <li>Motion Blur</li>
// <li>Fluid Simulation</li>
// <li>Matrix Multiplication</li>
// <li>Particle Systems</li>
// <li>Gravity</li>
// <li>N-body Simulation</li>
// <li>A material point method for snow simulation</li>
// <li>Heat Equation</li>
//
export default React.memo(Menu)
