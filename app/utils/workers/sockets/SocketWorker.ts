/**
 * Preserver of ports and manager of socket creation and
 * disconnections.
 * 
 * Author Kx
 */
class SocketLoader {
  public port: MessagePort;
  public loaded: boolean = false;
  private id: string | null = null;
  public static connected: number = 0;
  public static focused: SocketLoader | null = null;
  public static lastFocused: SocketLoader | null = null;
  protected static carriers: Array<SocketLoader> = [];

  /**
   * @param port - the port to preserve
   * @param loaded - instantiation status for stompjs client
   */
  constructor(port: MessagePort) {
    this.port = port; 
    SocketLoader.lastFocused = this;
    SocketLoader.carriers.push(this);
    SocketLoader.connected++;
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

    // Do not set last focused if it had been removed
    if (SocketLoader.lastFocused !== null && SocketLoader.carriers.includes(SocketLoader.lastFocused)) {
      SocketLoader.lastFocused = SocketLoader.focused;
    }

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
    // If setting last focused, null the field
    if (Object.is(this, SocketLoader.lastFocused)) {
      SocketLoader.lastFocused = null;
    }
    return this.loaded = bool;
  }

  /**
   * Removes an instance from carriers
   *
   * @returns the instance to remove
   */
  public remove(): SocketLoader {
    SocketLoader.carriers = SocketLoader.carriers.filter(carrier => carrier.id !== this.id);

    if (Object.is(this, SocketLoader.lastFocused)) {
      SocketLoader.lastFocused = null;
    }

    SocketLoader.connected--;
    return this;
  }

  /**
   * Gets the carriers
   *
   * @returns a clone of the SocketLoader collection
   */
  public static getCarriers(): Array<SocketLoader> {
    return Array.of(...SocketLoader.carriers);
  }

  /**
   * Checks if a carrier contains a client with a socket connection
   *
   * @returns true on active connection, else false
   */
  public static anyLoaded(): boolean {
    return SocketLoader.carriers.some(carrier => carrier.loaded === true);
  }

  /**
   * Gets SocketLoader with established connection
   *
   * @returns the SocketLoader with an established connection, else null
   */
  public static getLoaded(): SocketLoader | null {
    return SocketLoader.carriers.find(carrier => carrier.loaded === true) || null;
  }

  public static delegateToFirst(): SocketLoader {
    if (SocketLoader.anyLoaded()) {
      throw new Error('Delegating occurred during an active client');
    }

    if (SocketLoader.carriers.length === 0) {
      throw new Error('No carrier to delegate to');
    }

    const target = SocketLoader.carriers[0];
    target.setLoaded(true);
    return target;
  }
}

// Create enum values for switch operations
enum WorkerTask {
  Id = "ID",
  Focus = "FOCUS",
  Disconnect = "DISCONNECT",
  Send = "SEND",
}

// Implement worker's connect handler
onconnect = function (event: MessageEvent) {
  const port: MessagePort = event.ports[0];

  // Initialize signal for an active stompjs client
  const anyLoaded = SocketLoader.anyLoaded();

  // Initialize port preserver
  const socketLoader = new SocketLoader(port);

  // Notify client whether to initialize socket connection
  port.postMessage(!anyLoaded);

  // Designate port as main thread if no client connected to socket
  if (anyLoaded === false) {
    socketLoader.setLoaded(true);
  }

  port.onmessage = function(e: MessageEvent) {
    // Assumes a conforming value structure and splits it
    const kv = (e.data as string).split(/\:/);

    if (kv.length <= 1) {
      throw new Error("Not a valid entry");
    }

    // Operate relative to first delimited item (task)
    switch (kv[0]) {
      // Sets id
      case WorkerTask.Id: {
        if (!socketLoader) {
          throw new Error("Port retrieval failed");
        }

        socketLoader.setId(kv[1]);
        break;
      }
      // Sets client's current focus state
      case WorkerTask.Focus: {
        if (!socketLoader) {
          throw new Error("Port retrieval failed");
        }

        // TODO: Explore inutility; additonal arg unneeded
        const parsedInt = Number.parseInt(kv[2]);
        const focused: boolean | null = !Number.isNaN(parsedInt) ? !!parsedInt : null;

        if (focused === null || kv[2] === undefined) {
          throw new Error('Invalid boolean entry');
        }

        socketLoader.setFocused();
        break;
      }
      // Removes from active loaders and signals database / cookie updates
      case WorkerTask.Disconnect: {
        socketLoader.remove();
        const carrierCount = SocketLoader.getCarriers().length;

        // TODO: Implement cookie and database logic
        if (socketLoader.loaded && carrierCount === 0) {
          const body = JSON.stringify({ sighted: kv[2] });

          fetch("https://biblion.karnovah.com/api/v1/update-rates", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body,
          }).catch(exc => console.error(exc));
        }

        // Delegate rates and initialize stompjs to another client
        if (socketLoader.loaded && carrierCount >= 1) {
          // const rate = kv[2];
          // console.log(rate);

          if (Object.is(socketLoader, SocketLoader.focused) && SocketLoader.lastFocused instanceof SocketLoader) {
            if (SocketLoader.lastFocused !== null) {
              // Delegate to last focused
              SocketLoader.lastFocused.port.postMessage(!anyLoaded);
              SocketLoader.lastFocused.setLoaded(true);
            }
          } else if (!Object.is(socketLoader, SocketLoader.focused) && SocketLoader.focused !== null) {
            // Delegate to focused
            SocketLoader.focused.port.postMessage(!anyLoaded);
            SocketLoader.focused.setLoaded(true);
          } else {
            // Delegate to last carrier
            const target = SocketLoader.delegateToFirst();
            target.port.postMessage(anyLoaded);
          }
        }
        break;
      }
      // Transmits data from proxies to active socket loader
      case WorkerTask.Send: {
        /** 
         * Define data and target active stompjs client for transmission
         * Split into three as input has its own delimiter
         *
         * @example
         * `user:7` -> `SEND:user:7`
         */
        const workerRes: string = e.data.slice(5);
        const target = SocketLoader.getLoaded();
        if (target) {
          if (!(target instanceof SocketLoader)) {
            throw new Error('No SocketLoaders');
          }
          target.port.postMessage(workerRes);
        }
        break;
      }
    }
  }
}
