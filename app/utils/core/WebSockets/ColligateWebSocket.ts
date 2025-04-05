import { Client } from "@stomp/stompjs";

import { WSProps, ConnectionProps } from "./types/ColligateWebSocket.types";

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
  private webhookUrl;
  public initialized: boolean = false;

  /**
   * @param endpoint - the URL to connect to
   * @param destination - the route to receive data
   * @param broadcast - the network users subscribe to
   * @param webhookUrl - the webhook to send connection-related events to
   */
  constructor({
    endpoint,
    destination,
    broadcast,
    webhookUrl
  }: WSProps) {
    this.validateEndpoint(endpoint);

    this.endpoint = endpoint;
    this.destination = destination;
    this.broadcast = broadcast;

    this.webhookUrl = webhookUrl ?? null;

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
  public handleConnect({ extFn, intFn }: ConnectionProps): void {
    this.validateFields();

    if (this.webhookUrl !== null) {
      fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `Connected`,
        }),
      });
    }

    this.client.onConnect = () => {
      extFn();
      this.initialized = true;
      this.client.subscribe(this.broadcast as string, (data) => {
        const content = JSON.parse(data.body).content;
        intFn(content);
      });
    };
  }

  /**
   * Allows implementation for the disconnect event
   *
   * @param fn - the callback to invoke on disconnect
   */
  public handleDisconnect(fn: () => void): void {
    this.client.onDisconnect = fn;
  }

  /**
   * Defines the websocket's error handling fields 
   */
  public handleErrors(): void {
    this.client.onWebSocketError = (error) => {
      console.error('Error w/ websocket', error);
    }

    this.client.onStompError = (frame) => {
      console.error(`Broker reported error: ${frame.headers['message']}`);
      console.error(`Additional details: ${frame.body}`);
    };
  }

  /**
   * An endpoint / URL validator
   *
   * @param ep - the endpoint to validate
   * @throws an error if failed to conform to 
   * websocket pattern, else return nothing
   */
  private validateEndpoint(ep: string | undefined): void | Error {
    if (typeof ep !== "string") {
      if (typeof ep === undefined) {
        throw new Error('Endpoint undefined')
      }
      throw new Error('Endpoint is not a string')
    }

    const wsUrlPattern = /(?:ws|wss)\:\/\/[\w\d\:\-\.]/;
    if (ep.match(wsUrlPattern) === null) {
      throw new Error('Invalid endpoint');
    }
    return;
  }

  /**
   * Validates class fields
   *
   * @returns true if all fields are initialized
   * @throws an error if a field is not initialized
   */
  private validateFields(): true | Error {
    this.validateEndpoint(this.endpoint);

    if (this.endpoint && this.client && this.destination && this.broadcast) {
      return true;
    }

    throw new Error('Initialization unsuccessful');
  }

  /**
   * Extends the activate method of the StompJs client
   */
  public activate(): void {
    this.validateFields();

    this.client.activate();
  }

  /**
   * Extends the deactivate method of the StompJs client
   */
  public deactivate(): void {
    this.validateFields();

    this.client.deactivate();
  }

  /**
   * Directs a payload to a destination in the WebSocket
   *
   * @param content - the content to inject in payload
   */
  public send(kv: { [key: string]: string }): void {
    this.validateFields();

    this.client.publish({
      destination: this.destination as string,
      body: JSON.stringify(kv),
    });
  }

  /**
   * Extends the publish method of the StompJs client
   *
   * @param body - a stringified JSON object
   */
  public publish(body: string): void {
    this.validateFields();

    this.client.publish({
      destination: this.destination as string,
      body: body,
    });
  }
}
