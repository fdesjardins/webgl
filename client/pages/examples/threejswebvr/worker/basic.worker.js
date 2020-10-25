const workerSpeed = 3*Math.random()
onmessage = function(e) {
  postMessage('received');
  const result = [(.5-Math.random())*workerSpeed,(.5-Math.random())*workerSpeed,(.5-Math.random())*workerSpeed]
  if (false) {

  } else {
    const workerResult = result
    postMessage(workerResult);
  }
}
