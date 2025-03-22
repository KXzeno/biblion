import { Client } from "@stomp/stompjs";

import { WSProps } from "./types/ColligateWebSocket.types";

/**
 * A class that streamlines the 
 * connect process of websockets
 *
 * @author Kx
 */
export default class ColligateWebSocket {
  private client;
  private endpoint;
  private destination;
  private broadcast;

  /**
   * @param endpoint - the URL to connect to
   * @param destination - the route to receive data
   * @param broadcast - the network users subscribe to
   */
  constructor({
    endpoint,
    destination,
    broadcast
  }: WSProps) {
    this.validateEndpoint(endpoint);

    this.endpoint = endpoint;
    this.destination = destination;
    this.broadcast = broadcast;

    this.client = new Client({
      brokerURL: endpoint,
    });
  }

  /**
   * Behavior on a successful connection to the websocket
   *
   * @param extFn - the external logic deployed outside of
   * the subscription logic
   * @param intFn - the subscription logic
   */
  private handleConnect(extFn: () => unknown, intFn: (content: unknown) => unknown) {
    this.client.onConnect = (frame) => {
      extFn();
      console.log('Connected.');
      this.client.subscribe(this.broadcast, (data) => {
        const content = JSON.parse(data.body).content;
        intFn(content);
      });
    };
  }

  /**
   * An endpoint / URL validator
   *
   * @param ep - the endpoint to validate
   * @throws an error if failed to conform to 
   * websocket pattern, else return nothing
   */
  private validateEndpoint(ep: string): void | Error {
    const wsUrlPattern = /ws\:\/\/[\w\d\:\-\.]/;
    if (ep.match(wsUrlPattern) === null) {
      throw new Error('Invalid endpoint');
    }
    return;
  }
}
