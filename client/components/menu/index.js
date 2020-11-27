import React from 'react'
import PT from 'prop-types'
import { Link } from 'react-router-dom'
import { css } from 'emotion'

import examplesIndex from '-/examples-index'

const tagStyle = css`
  font-size: 0.7em;
  color: #888;
  background-color: #eee;
  padding: 0 5px;
  height: 20px;
  border: 1px solid #bbb;
  border-radius: 5px;
  margin-left: 1em;
  cursor: pointer;
  display: inline-block;
  opacity: 0.5;
  transition: all 0.25s;

  &:hover {
    opacity: 1;
  }

  &.threejs {
    background-color: #ddeeff;
    border-color: #bbccff;
  }
  &.webvr {
    background-color: #ffe6e6;
    border-color: #ddc6c6;
  }
  &.gpgpu {
    background-color: #e6ffe6;
    border-color: #c6ddc6;
  }
`

const Tags = ({ tags, setFilter }) => {
  return (
    <>
      {tags.split(',').map((tag) => (
        <div
          key={tag}
          className={`${tagStyle} ${tag} tag`}
          onClick={() => setFilter(tag)}
        >
          {tag}
        </div>
      ))}
    </>
  )
}

Tags.propTypes = {
  tags: PT.string,
  setFilter: PT.func,
}

const menuItemStyle = css`
  font-size: 1em;
  margin-bottom: 0.4em;
  display: flex !important;
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
  setFilter: PT.func,
}

const Menu = () => {
  const [filter, setFilter] = React.useState('')

  const examples = examplesIndex.filter(
    (x) =>
      x.title.toLowerCase().match(new RegExp(filter.toLowerCase())) ||
      x.tags.toLowerCase().match(new RegExp(filter.toLowerCase()))
  )

  const className = `ui input fluid transparent small ${
    filter !== '' ? 'left icon' : ''
  }`

  return (
    <>
      <div className={className}>
        {filter !== '' && (
          <button
            onClick={() => setFilter('')}
            className="ui button basic"
            style={{ boxShadow: 'none', padding: 0, margin: 0 }}
          >
            <i className="close icon"></i>
          </button>
        )}
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

export default React.memo(Menu)
