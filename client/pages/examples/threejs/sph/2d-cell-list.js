export const buildCells = ({ cellmin, cellmax, cellw }) => {
  const cells = []
  for (let i = cellmin; i < cellmax; i += cellw) {
    for (let j = cellmin; j < cellmax; j += cellw) {
      cells.push([i, j])
    }
  }
  return cells
}

export const buildCellNeighbors = (
  cells,
  { stride, cellmin, cellmax, cellw }
) => {
  return cells.map((cell, i) => {
    const nb = []
    if (cell[0] === cellmin && cell[1] === cellmin) {
      nb.push(i + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else if (cell[0] === cellmin && cell[1] < cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else if (cell[0] === cellmin && cell[1] === cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i + stride - 1)
      nb.push(i + stride)
    } else if (cell[0] < cellmax - cellw && cell[1] === cellmin) {
      nb.push(i + 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
      nb.push(i + stride)
      nb.push(i + stride + 1)
    } else if (cell[0] === cellmax - cellw && cell[1] === cellmin) {
      nb.push(i + 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
    } else if (cell[0] === cellmax - cellw && cell[1] < cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
    } else if (cell[0] === cellmax - cellw && cell[1] === cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
    } else if (cell[0] < cellmax - cellw && cell[1] === cellmax - cellw) {
      nb.push(i - 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i + stride - 1)
      nb.push(i + stride)
    } else {
      nb.push(i - 1)
      nb.push(i + 1)
      nb.push(i - stride - 1)
      nb.push(i - stride)
      nb.push(i - stride + 1)
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
    // const y = position.y >= cell[1] && position.y < cell[1] + cellw
    const z = position.z >= cell[1] && position.z <= cell[1] + cellw
    if (x && z) {
      return i
    }
  }
}
