export const buildCells = ({ cellmin, cellmax, cellw }) => {
  const cells = []
  for (let i = cellmin; i < cellmax; i += cellw) {
    for (let j = cellmin; j < cellmax; j += cellw) {
      for (let k = cellmin; k < cellmax; k += cellw) {
        cells.push([i, j, k])
      }
    }
  }
  return cells
}

/**
 * Assuming a 3x3 matrix:
 *
 *        / |        /  |        /  |
 *      /   |      /    |      /    |
 *    /   8 |    /   17 |    /   26 |
 *  /   7   |  /   16   |  /   25   |
 *  | 6   5 |  | 15  14 |  | 24  23 |
 *  |   4   |  |   13   |  |   22   |
 *  | 3   2 /  | 12  11 |  | 21  20 |
 *  |   1  /   |   10 /    |   19 /
 *  | 0  /     | 9  /      | 18 /
 *  |  /       |  /        |  /
 *  |/         |/          |/
 *
 */
export const buildCellNeighbors = (
  cells,
  { stride, cellmin, cellmax, cellw }
) => {
  return cells.map((cell, i) => {
    const nb = []
    if (cell[0] === cellmin && cell[1] === cellmin && cell[2] === cellmin) {
      nb.push(i + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
      nb.push(i + stride ** 2 + stride)
      nb.push(i + stride ** 2 + stride + 1)
    } else if (
      cell[0] === cellmin &&
      cell[1] < cellmax - cellw &&
      cell[2] === cellmin
    ) {
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - stride + 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
      nb.push(i + stride ** 2 + stride)
      nb.push(i + stride ** 2 + stride + 1)
    } else if (
      cell[0] === cellmin &&
      cell[1] === cellmin &&
      cell[2] < cellmax - cellw
    ) {
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
      nb.push(i + stride ** 2 + stride - 1)
      nb.push(i + stride ** 2 + stride)
      nb.push(i + stride ** 2 + stride + 1)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] === cellmin &&
      cell[2] === cellmin
    ) {
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride ** 2 + stride + 1)
      nb.push(i + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
      nb.push(i + stride ** 2 + stride)
      nb.push(i + stride ** 2 + stride + 1)
    } else if (
      cell[0] === cellmin &&
      cell[1] < cellmax - cellw &&
      cell[2] < cellmax - cellw
    ) {
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
      nb.push(i + stride ** 2 - stride - 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - stride + 1)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
      nb.push(i + stride ** 2 + stride - 1)
      nb.push(i + stride ** 2 + stride)
      nb.push(i + stride ** 2 + stride + 1)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] === cellmin &&
      cell[2] < cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride ** 2 + stride - 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride ** 2 + stride + 1)
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
      nb.push(i + stride ** 2 + stride - 1)
      nb.push(i + stride ** 2 + stride)
      nb.push(i + stride ** 2 + stride + 1)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] < cellmax - cellw &&
      cell[2] === cellmin
    ) {
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - stride + 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride ** 2 + stride + 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - stride + 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
      nb.push(i + stride ** 2 + stride)
      nb.push(i + stride ** 2 + stride + 1)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] < cellmax - cellw &&
      cell[2] < cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - stride - 1)
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - stride + 1)
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride ** 2 + stride - 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride ** 2 + stride + 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
      nb.push(i + stride ** 2 - stride - 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - stride + 1)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
      nb.push(i + stride ** 2 + stride - 1)
      nb.push(i + stride ** 2 + stride)
      nb.push(i + stride ** 2 + stride + 1)
    } else if (
      cell[0] === cellmax - cellw &&
      cell[1] === cellmin &&
      cell[2] === cellmin
    ) {
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride ** 2 + stride + 1)
      nb.push(i + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else if (
      cell[0] === cellmin &&
      cell[1] === cellmax - cellw &&
      cell[2] === cellmin
    ) {
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - stride + 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
    } else if (
      cell[0] === cellmin &&
      cell[1] === cellmin &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + stride - 1)
      nb.push(i + stride ** 2 + stride)
    } else if (
      cell[0] === cellmax - cellw &&
      cell[1] === cellmax - cellw &&
      cell[2] === cellmin
    ) {
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - stride + 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + 1)
    } else if (
      cell[0] === cellmin &&
      cell[1] === cellmax - cellw &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - 1)
      nb.push(i + stride ** 2 - stride - 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
    } else if (
      cell[0] === cellmax - cellw &&
      cell[1] === cellmin &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + stride - 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
    } else if (
      cell[0] === cellmax - cellw &&
      cell[1] === cellmax - cellw &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - stride - 1)
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - 1)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] === cellmax - cellw &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - stride - 1)
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - 1)
      nb.push(i + stride ** 2 - stride - 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
    } else if (
      cell[0] === cellmax - cellw &&
      cell[1] === cellmax - cellw &&
      cell[2] < cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - stride - 1)
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - stride + 1)
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i - 1)
      nb.push(i + 1)
    } else if (
      cell[0] === cellmax - cellw &&
      cell[1] < cellmax - cellw &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - stride - 1)
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + stride - 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
    } else if (
      cell[0] === cellmin &&
      cell[1] < cellmax - cellw &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride ** 2 - stride - 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + stride - 1)
      nb.push(i + stride ** 2 + stride)
    } else if (
      cell[0] === cellmin &&
      cell[1] === cellmax - cellw &&
      cell[2] < cellmax - cellw
    ) {
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride ** 2 - stride - 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - stride + 1)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] === cellmin &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + stride - 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + stride - 1)
      nb.push(i + stride ** 2 + stride)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] < cellmax - cellw &&
      cell[2] === cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - stride - 1)
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + stride - 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride ** 2 - stride - 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + stride - 1)
      nb.push(i + stride ** 2 + stride)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] === cellmax - cellw &&
      cell[2] === cellmin
    ) {
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - stride + 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - stride + 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
    } else if (
      cell[0] < cellmax - cellw &&
      cell[1] === cellmax - cellw &&
      cell[2] < cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - stride - 1)
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - stride + 1)
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride ** 2 - stride - 1)
      nb.push(i + stride ** 2 - stride)
      nb.push(i + stride ** 2 - stride + 1)
      nb.push(i + stride ** 2 - 1)
      nb.push(i + stride ** 2)
      nb.push(i + stride ** 2 + 1)
    } else if (
      cell[0] === cellmax - cellw &&
      cell[1] === cellmin &&
      cell[2] < cellmax - cellw
    ) {
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride ** 2 + stride - 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride ** 2 + stride + 1)
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else if (
      cell[0] === cellmax - cellw &&
      cell[1] < cellmax - cellw &&
      cell[2] === cellmin
    ) {
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - stride + 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride ** 2 + stride + 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else {
      nb.push(i - stride ** 2 - stride - 1)
      nb.push(i - stride ** 2 - stride)
      nb.push(i - stride ** 2 - stride + 1)
      nb.push(i - stride ** 2 - 1)
      nb.push(i - stride ** 2)
      nb.push(i - stride ** 2 + 1)
      nb.push(i - stride ** 2 + stride - 1)
      nb.push(i - stride ** 2 + stride)
      nb.push(i - stride ** 2 + stride + 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    }
    return nb
  })
}

export const assignToCell = (cells, cellw, position) => {
  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i]
    const x = position.x >= cell[0] && position.x <= cell[0] + cellw
    const y = position.y >= cell[1] && position.y <= cell[1] + cellw
    const z = position.z >= cell[2] && position.z <= cell[2] + cellw
    if (x && y && z) {
      return i
    }
  }
}
