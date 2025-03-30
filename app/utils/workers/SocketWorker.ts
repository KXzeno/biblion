onconnect = function (event: MessageEvent) {
  const port: MessagePort = event.ports[0];

  let num: number = 0;

  port.onmessage = function (e: MessageEvent) {
    num++;
    const workerRes: string = `${e.data[0]}: ${num}`;
    port.postMessage(workerRes);
  }
}
