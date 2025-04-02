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

export default function WebSocket({ children }: { children: React.ReactNode }) {
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
    console.log(state.pendingSignal);
    if (state.client && state.pendingSignal.length > 0) {
      console.log('Client sends?');
      state.client.send({ sighted: `${state.pendingSignal}` });
    }
    dispatch({ type: ActionType.Offload, payload: { pendingSignal: "" } });
  }, [state.pendingSignal]);

  React.useEffect(() => {
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
              /** For production */
              const { 
                C_ENDPOINT, 
                C_DESTINATION, 
                C_BROADCAST,
                DISCORD_WH_ENDPOINT,
              } = process.env;

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
                  try {
                    // fetch(DISCORD_WH_ENDPOINT, {
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
        }
      };

      // TODO: Implement unload logic (within library)
      const unloadHandler = () => handleWorkerEvent(nonceCarrier, SocketWorkerEvent.Unload);

      // Communicates last and current focused client to web worker
      const focusHandler = () => handleWorkerEvent(nonceCarrier, SocketWorkerEvent.Focus, '1');

      window.onbeforeunload = unloadHandler;
      window.onfocus = focusHandler;
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
        state.client.send({ sighted: state.rates });
        return;
      }
      port.postMessage(`SEND:${state.rates}`);
      dispatch({ type: ActionType.Rate, payload: { rates: "" } });
    }
  }

  return (
    <SocketContext.Provider 
      value={{ 
        send: sendMsg,
        signals: state.signals,
        rates: state.rates,
        sendFromProxy,
        client: state.client,
        pendingSignal: state.pendingSignal,
      }}>
      <SocketDispatchContext.Provider value={{dispatch}}>
        {children}
      </SocketDispatchContext.Provider>
    </SocketContext.Provider>
  );
}

