/**
 * Preserver of ports and manager of socket creation and
 * disconnections.
 * 
 * Author Kx
 */
class SocketLoader {
  public port: MessagePort;
  public loaded: boolean = false;
  public static focused: SocketLoader | null = null;
  public static lastFocused: SocketLoader | null = null;
  private id: string | null = null;

  /**
   * @param port - the port to preserve
   * @param loaded - instantiation status for stompjs client
   */
  constructor(port: MessagePort) {
    this.port = port; 
    SocketLoader.lastFocused = this;
  }

  /**
   * Sets port id
   * 
   * @param id - id to assign
   */
  public setId(id: string): void {
    this.id = id;
  }

  /**
   * Gets port id
   *
   * @returns an existing port id, else null 
   */
  public getId(): string | null {
    return this.id;
  }

  /**
   * Defines the static members that indicates 
   * the user's primary and last used client
   */
  public setFocused(): void {
    if (Object.is(SocketLoader.focused, this)) {
      return;
    }
    SocketLoader.lastFocused = SocketLoader.focused;
    SocketLoader.focused = this;
  }

  /**
   * Defines state indicative of 
   * an initialized stompjs client
   *
   * @param bool - state's binary assignment
   * @returns the state's binary assignment
   */
  public setLoaded(bool: boolean): boolean {
    return this.loaded = bool;
  }
}

// Initialize mutable array for client(s) synchronization
let carriers: Array<SocketLoader> = [];

// Implement worker's connect handler
onconnect = function (event: MessageEvent) {
  const port: MessagePort = event.ports[0];

  // Initialize signal for an active stompjs client
  const anyLoaded: boolean = carriers.some(carrier => carrier.loaded === true);

  // Initialize port preserver
  const socketLoader = new SocketLoader(port);
  carriers.push(socketLoader);

  // Notify client whether to initialize socket connection
  port.postMessage(!anyLoaded);

  // Designate port as main thread if no client connected to socket
  if (anyLoaded === false) {
    socketLoader.setLoaded(true);
  }

  port.onmessage = function (e: MessageEvent) {
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
        carriers = carriers.filter(carrier => carrier.getId() !== loader.getId());
        loader.port.close();
        break;
      }
      case 'FOCUS': {
        const loader = carriers.find(carrier => carrier.getId() === kv[1]);
        if (!loader) {
          throw new Error("Port retrieval failed");
        }

        // TODO: Explore inutility; additonal arg unneeded
        const parsedInt = Number.parseInt(kv[2]);
        const focused: boolean | null = !Number.isNaN(parsedInt) ? !!parsedInt : null;

        if (focused === null || kv[2] === undefined) {
          throw new Error('Invalid boolean entry');
        }

        loader.setFocused();
        break;
      }
      case 'LOADED': {

      }
    }

    // Define data and target active stompjs client for transmission
    const workerRes: string = `port: ${e.data} - ${e.data}`;
    const target = carriers.find(carrier => carrier.loaded === true);
    console.log(carriers);
    if (target) {
      if (!(target instanceof SocketLoader)) {
        throw new Error('No SocketLoaders');
      }
      target.port.postMessage(workerRes);
    }
  }
}
