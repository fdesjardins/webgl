const R = require('ramda')

const tensor = () => {}

const mag = a => {
  return Math.sqrt(R.sum(a.map(x => x * x)))
}

const dot = (a, b) => {
  return R.sum(R.zip(a, b).map(([x, y]) => x * y))
}

const cross = (a, b) => {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ]
}

const main = async () => {
  // const t = tensor([1, 0, 1, 0])
  const a = [1, 0, 0]
  const b = [0, 1, 1]
  console.log(dot(a, b))
  console.log(cross(a, b))
}

if (!module.parent) {
  main().then(() => {})
}
