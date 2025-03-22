import { Client } from "@stomp/stompjs";

/**
 * A class that streamlines the 
 * connect process of websockets
 *
 * @author Kx
 */
export default class ColligateWebSocket {
  private client;

  /**
   * @param endpoint - the URL to connect to
   */
  constructor(endpoint: string) {
    this.validateEndpoint(endpoint);

    this.client = new Client({
      brokerURL: endpoint,
    });
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
