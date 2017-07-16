exports.shouldUpdate = (lastProps, nextProps) => {
  return JSON.stringify(lastProps) !== JSON.stringify(nextProps)
}

/**
 * Helper method for making Baobab selects easier
 */
const splitBaobabQuery = query => query.split('.')
exports.sq = splitBaobabQuery
