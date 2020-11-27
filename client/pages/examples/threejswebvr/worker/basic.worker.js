const workerSpeed = 3 * Math.random() + 0.2
onmessage = function (e) {
  postMessage('received')
  const result = [
    (0.5 - Math.random()) * workerSpeed,
    (0.5 - Math.random()) * workerSpeed,
    (0.5 - Math.random()) * workerSpeed,
  ]
  const workerResult = result
  postMessage(workerResult)
}
