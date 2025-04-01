"use client";

import React from "react";
import "dotenv/config";

import ColligateWebSocket from "@/utils/core/WebSockets";
import { SharedWorkerCarrier } from "@/utils/workers";
import { handleWorkerEvent } from "@/utils/auxil/socketWorkerTasks";
import { SocketWorkerEvent } from "@/utils/workers/types/workers.types";
import { type ContextData } from "@/providers/SocketProvider/SocketProvider.types";

export const SocketContext: React.Context<ContextData> = React.createContext({
  send: () => {},
  signals: [""],
  pendingSignal: "",
  rates: "",
  setRates: (() => {}) as ContextData['setRates'],
  sendFromProxy: () => {},
  client: null as ColligateWebSocket | null,
});

export default function WebSocket({ children }: { children: React.ReactNode }) {
  const [signals, setSignals] = React.useState<Array<string>>([]);
  const [pendingSignal, setPendingSignal] = React.useState<string>("");
  const [rates, setRates] = React.useState<string>("");
  const [carrier, setCarrier] = React.useState<SharedWorkerCarrier>({ worker: null, id: null });
  const [client, setClient] = React.useState<ColligateWebSocket | null>(null);

  // TODO: Create logic that updates new rates for all clients
  // TODO: Transform states to reducer and create dispatcher context
  const sendFromProxy = React.useCallback(() => {
    console.log(pendingSignal);
    if (client && pendingSignal.length > 0) {
      console.log('Client sends?');
      client.send({ sighted: `${pendingSignal}` });
    }
    setPendingSignal("");
  }, [pendingSignal]);

  React.useEffect(() => {
    if (!!window.SharedWorker) {
      const workerOptions: WorkerOptions = {
        name: "socketWorker",
        type: "module",
      }

      const nonceWorker = new SharedWorker("workers/SocketWorker.js", workerOptions);
      const id = crypto.randomUUID();
      const nonceCarrier = { worker: nonceWorker, id };
      setCarrier(() => nonceCarrier);

      nonceWorker.port.postMessage(`ID:${id}`);

      nonceWorker.port.onmessage = (e: MessageEvent) => {
        switch (typeof e.data) {
          case 'boolean': {
            if (e.data === true) {
              // Initialize socket

              /** For production */
              // const { C_ENDPOINT, C_DESTINATION, C_BROADCAST } = process.env;

              /** For development */
              const [ C_ENDPOINT, C_DESTINATION, C_BROADCAST ] = ["wss://biblion-colligate.onrender.com/colligate-websocket", "/app/observe/0", "/temp/audits/0" ];

              const stompClient = new ColligateWebSocket({
                endpoint: C_ENDPOINT,
                destination: C_DESTINATION,
                broadcast: C_BROADCAST,
              });

              stompClient.handleConnect({
                extFn() {
                },
                intFn(content) {
                  setSignals((prev) => [...prev, content]);
                  try {
                    fetch("https://discord.com/api/webhooks/1355217343109795933/qe744baN1kkgcCK5-GmjlNAoctTUlhPNBhvageQtjykPX8aA9kLSKx4p_7wRKOPUe7gv", {
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

              setClient(() => stompClient);
              break;
            }
            // False
            break;
          }
          case 'string': {
            setPendingSignal(e.data);
            break;
          }
        }
      };

      const unloadHandler = () => handleWorkerEvent(nonceCarrier, SocketWorkerEvent.Unload);
      const focusHandler = () => handleWorkerEvent(nonceCarrier, SocketWorkerEvent.Focus, '1');

      window.onbeforeunload = unloadHandler;
      window.onfocus = focusHandler;
    }

    return () => {
      window.onbeforeunload = null;
      window.onfocus = null;
    };
  }, []);

  function sendMsg() {
    if (carrier.worker) {
      const { port } = carrier.worker;
      if (client) {
        client.send({ sighted: rates });
        return;
      }
      port.postMessage(`SEND:${rates}`);
      setRates("");
    }
  }

  return (
    <SocketContext.Provider 
      value={{ 
        send: sendMsg,
        signals,
        rates, setRates,
        sendFromProxy,
        client,
        pendingSignal,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

