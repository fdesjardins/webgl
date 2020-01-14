import React from 'react'

export const shouldUpdate = (lastProps, nextProps) => {
  return JSON.stringify(lastProps) !== JSON.stringify(nextProps)
}

/**
 * Helper method for making Baobab selects easier
 */
const splitBaobabQuery = query => query.split('.')
export const sq = splitBaobabQuery

export const wrapComponent = (Component, { ...first }) => ({
  children,
  context,
  ...rest
}) => (
  <Component {...first} {...rest}>
    {children}
  </Component>
)
