onmessage = function(e) {
  postMessage('received');
  const result = [.5-Math.random(),.5-Math.random(),.5-Math.random()]
  if (false) {

  } else {
    const workerResult = result
    postMessage(workerResult);
  }
}
