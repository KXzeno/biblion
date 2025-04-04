"use client";

import React from "react";
import "dotenv/config";

import ColligateWebSocket from "@/utils/core/WebSockets";
import { 
  handleWorkerEvent,
  socketProviderReducer as reducer
} from "@/utils/auxil/socketWorkerTasks";
import { SocketWorkerEvent } from "@/utils/workers/types/workers.types";
import { 
  type ContextData,
  type DispatchContextData,
  type ReducerState,
  type ReducerAction,
  ActionType,
  SocketProviderProps,
} from "@/providers/SocketProvider/SocketProvider.types";

export const SocketContext: React.Context<ContextData> = React.createContext({
  send: () => {},
  signals: [""],
  pendingSignal: "",
  rates: "",
  sendFromProxy: () => {},
  client: null as ColligateWebSocket | null,
});

export const SocketDispatchContext: React.Context<DispatchContextData> = React.createContext({
  dispatch: (() => {}) as DispatchContextData['dispatch'],
});

export default function WebSocket(props: SocketProviderProps) {
  const { children, DISCORD_WH_ENDPOINT, } = props;
  const { C_ENDPOINT, C_DESTINATION, C_BROADCAST } = props.ColligateWebSocketConstructorParams;

  const initialData = {
    carrier: { worker: null, id: null },
    client: null,
    signals: [],
    rates: "",
    pendingSignal: "",
  }

  const [state, dispatch] = React.useReducer<ReducerState, [ReducerAction]>(reducer, initialData);
  // TODO: Create logic that updates new rates for all clients
  // TODO: Test if API can be hit on all unload

  /**
   * A memoized function to send from "proxies" to 
   * the main thread containing the stompjs client
   */
  const sendFromProxy = React.useCallback(() => {
    if (state.client && state.pendingSignal.length > 0) {
      state.client.send({ sighted: state.pendingSignal });
    }
    dispatch({ type: ActionType.Offload, payload: { pendingSignal: "" } });
  }, [state.client, state.pendingSignal]);

  React.useEffect(() => {
    // Reference to client for unload event handling
    let nonceRates: number = 0;

    // Execute if browser has web worker accessibility
    if (!!window.SharedWorker) {
      const workerOptions: WorkerOptions = {
        name: "socketWorker",
        type: "module",
      }

      // Initialize a worker and worker id that exists on mount
      const nonceWorker = new SharedWorker("workers/SocketWorker.js", workerOptions);
      const id = crypto.randomUUID();

      // Initialize a named object containing worker definitions
      const nonceCarrier = { worker: nonceWorker, id };

      // Due to a mount-only persistence, preserve the carrier via reducer state
      dispatch({ type: ActionType.Carrier, payload: { carrier: nonceCarrier } });

      // Initialize ID in the SharedWorker
      nonceWorker.port.postMessage(`ID:${id}`);

      nonceWorker.port.onmessage = (e: MessageEvent) => {
        switch (typeof e.data) {
          // Boolean values indicate client creations
          case 'boolean': {
            if (e.data === true) {
              // Initialize stompjs client via abstraction from ColligateWebSocket
              const stompClient = new ColligateWebSocket({
                endpoint: C_ENDPOINT,
                destination: C_DESTINATION,
                broadcast: C_BROADCAST,
              });

              stompClient.handleConnect({
                extFn() {
                  // TODO: Investigate inutility
                },
                intFn(content) {
                  dispatch({ type: ActionType.Signal, payload: { signal: content } });
                  nonceRates = Number.parseInt(content.split(/\-/)[1]);
                  try {
                    fetch(DISCORD_WH_ENDPOINT as string, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        content: `${content}`,
                      }),
                    });
                  } catch (e) {
                    console.error(e);
                  }
                },
              });

              stompClient.handleErrors();
              stompClient.activate();

              // Due to a mount-only persistence, preserve the client via reducer state
              dispatch({ type: ActionType.Client, payload: { client: stompClient } });
              break;
            }
            // Control flow hit 'false'
            break;
          }
          // String values indicate data traversal via workers to a target client
          case 'string': {
            dispatch({ type: ActionType.Offload, payload: { pendingSignal: e.data } });
            break;
          }
          // Handle specialized requests
          case 'object': {
            // Handle keep-operational request
            if ('keepAlive' in e.data) {
              setTimeout(() => handleWorkerEvent(nonceCarrier, SocketWorkerEvent.KeepAlive), 500);
            }
            break;
          }
          default: throw new Error('Not a valid data model');
        }
      };

      /**
       * Ostensibly, using unload state would look feasible, but it's
       * less performant, invoke at certain states, or not invoke at all
       *
       * @see {@link https://developer.chrome.com/docs/web-platform/page-lifecycle-api#developer-recommendations-for-each-state}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#event_type}
       */

      // Detects end of session and updates cookie / db
      const terminateHandler = () => {
        if (document.hidden) {
          handleWorkerEvent(nonceCarrier, SocketWorkerEvent.Terminate, `${nonceRates}`);
        }
      };

      // Communicates last and current focused client to web worker
      const focusHandler = () => handleWorkerEvent(nonceCarrier, SocketWorkerEvent.Focus, '1');
      // document.addEventListener("visibilitychange", terminateHandler);
      document.addEventListener("visibilitychange", terminateHandler);

      window.addEventListener("focus", focusHandler);
      // window.onbeforeunload = unloadHandler;
      // window.onfocus = focusHandler;
    } else {
      // Initialize stompjs client on browsers with no SharedWorker support
      const stompClient = new ColligateWebSocket({
        endpoint: C_ENDPOINT,
        destination: C_DESTINATION,
        broadcast: C_BROADCAST,
      });

      stompClient.handleConnect({
        extFn() {
        },
        intFn(content) {
          dispatch({ type: ActionType.Signal, payload: { signal: content } });
          nonceRates = Number.parseInt(content.split(/\-/)[1]);
          try {
            fetch(DISCORD_WH_ENDPOINT as string, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: `${content}`,
              }),
            });
          } catch (e) {
            console.error(e);
          }
        },
      });

      stompClient.handleErrors();
      stompClient.activate();

      dispatch({ type: ActionType.Client, payload: { client: stompClient } });
    }

    // Cleanup
    return () => {
      window.onbeforeunload = null;
      window.onfocus = null;
    };
  }, []);

  /**
   * Transmits then resets current value in `rates`
   */
  function sendMsg(): void {
    if (state.carrier.worker) {
      const { port } = state.carrier.worker;
      if (state.client) {
        state.client.send({ sighted: `${state.carrier.id}:${state.rates}` });
        dispatch({ type: ActionType.Rate, payload: { rates: "" } });
        return;
      }
      port.postMessage(`SEND:${state.rates}`);
      dispatch({ type: ActionType.Rate, payload: { rates: "" } });
    } else {
      // For mobile
      if (state.client) {
        state.client.send({ sighted: `${state.carrier.id}:${state.rates}` });
        dispatch({ type: ActionType.Rate, payload: { rates: "" } });
      }
    }
  }

  return (
    <SocketContext.Provider 
      value={{ 
        send: sendMsg,
        sendFromProxy,
        signals: state.signals,
        rates: state.rates,
        client: state.client,
        pendingSignal: state.pendingSignal,
      }}>
      <SocketDispatchContext.Provider value={{dispatch}}>
        {children}
      </SocketDispatchContext.Provider>
    </SocketContext.Provider>
  );
}

