import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { css } from '@emotion/css'

const tagStyle = css`
  font-size: 0.75em;
  font-weight: bold;
  color: var(--font-color-dark);
  background-color: #eee;
  padding: 0 5px;
  border-radius: 3px;
  margin-left: 1em;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  height: 20px;
  margin-top: 5px;

  &:hover {
    opacity: 1;
  }

  &.basics {
    background-color: var(--green);
  }
  &.threejs {
    background-color: var(--blue);
    color: var(--font-color-light);
  }
  &.webvr {
    background-color: var(--orange);
  }
  &.gpgpu {
    background-color: var(--red);
    color: var(--font-color-vdark);
  }
`

const Tags = ({ tags, setFilter }) => {
  return (
    <>
      {tags.split(',').map((tag) => (
        <div key={tag} className={`${tagStyle} ${tag} tag`} onClick={() => setFilter(tag)}>
          {tag}
        </div>
      ))}
    </>
  )
}

Tags.propTypes = {
  tags: PropTypes.string,
  setFilter: PropTypes.func,
}

const menuItemStyle = css`
  margin-bottom: 0.4em;
  display: flex;
`

const MenuItem = ({ title, to, tags, setFilter }) => (
  <div className={`item ${menuItemStyle}`}>
    <Link to={`/${to}`}>{title}</Link>
    <Tags tags={tags} setFilter={setFilter} />
  </div>
)

MenuItem.propTypes = {
  title: PropTypes.string,
  to: PropTypes.string,
  tags: PropTypes.string,
  setFilter: PropTypes.func,
}

const menuStyle = css`
  border-bottom: 1px solid var(--font-color-dark);
  margin-bottom: 0.75em;
`

const inputStyle = css`
  input {
    background: none;
    border: none;
    color: var(--font-color-light);
    margin-bottom: 0.25em;
    outline: none;
  }
  span {
    cursor: pointer;
  }
`

const Menu = ({ index }) => {
  const [filter, setFilter] = React.useState('')

  const examples = index.filter(
    (x) =>
      x.title.toLowerCase().match(new RegExp(filter.toLowerCase())) ||
      x.tags.toLowerCase().match(new RegExp(filter.toLowerCase()))
  )

  return (
    <>
      <div className={menuStyle}>
        <div className={inputStyle}>
          <input
            style={filter.length > 0 ? { width: `${20 + 9.25 * filter.length}px` } : {}}
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          {filter.length > 0 && <span onClick={() => setFilter('')}>✕</span>}
        </div>
      </div>
      <div>
        {examples.map(({ key, title, slug, tags }) => {
          return <MenuItem key={slug} title={title} to={slug} tags={tags} setFilter={setFilter} />
        })}
      </div>
    </>
  )
}

Menu.propTypes = {
  index: PropTypes.arrayOf(PropTypes.object),
}

export default React.memo(Menu)
