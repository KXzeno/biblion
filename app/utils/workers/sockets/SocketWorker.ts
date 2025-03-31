class SocketLoader {
  public port: MessagePort;
  public loaded: boolean;
  private focused: boolean = false;
  private id: string | null = null;

  constructor(port: MessagePort, loaded: boolean) {
    this.port = port; 
    this.loaded = loaded;
  }

  public setId(id: string): void {
    this.id = id;
  }

  public getId(): string | null {
    return this.id;
  }

  public setFocused(bool: boolean) {
    this.focused = bool;
  }
}

let carriers: Array<SocketLoader> = [];

onconnect = function (event: MessageEvent) {
  const port: MessagePort = event.ports[0];

  const anyLoaded: boolean = carriers.some(carrier => carrier.loaded === true);

  carriers.push(new SocketLoader(port, carriers.length === 0 || !anyLoaded));

  port.onmessage = function (e: MessageEvent) {
    console.log('O');
    console.log(carriers);
    const kv = (e.data as string).split(/\:/);

    if (kv.length <= 1) {
      throw new Error("Not a valid entry");
    }

    switch (kv[0]) {
      case 'ID': {
        const loader = carriers.at(carriers.length - 1);
        if (!loader) {
          throw new Error("Port retrieval failed");
        }

        loader.setId(kv[1]);
        break;
      }
      case 'DISCONNECT': {
        const loader = carriers.find(carrier => carrier.getId() === kv[1]);
        if (!loader) {
          throw new Error("Port retrieval failed");
        }

        loader.port.close();
        carriers = carriers.filter(carrier => carrier.getId() !== loader.getId());
        break;
      }
      case 'FOCUS': {
        const loader = carriers.find(carrier => carrier.getId() === kv[1]);
        if (!loader) {
          throw new Error("Port retrieval failed");
        }

        const parsedInt = Number.parseInt(kv[2]);
        const focused = !Number.isNaN(parsedInt) ? !!parsedInt : null;

        if (focused === null || kv[2] === undefined) {
          throw new Error('Invalid boolean entry');
        }

        loader.setFocused(focused);
        break;
      }
    }

    console.log("S");
    console.log(carriers);

    const workerRes: string = `port: ${e.data} - ${e.data}`;
    const target = carriers.find(carrier => carrier.loaded === true);

    if (!(target instanceof SocketLoader)) {
      throw new Error('No SocketLoaders');
    }
    target.port.postMessage(workerRes);
  }
}
