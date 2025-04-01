"use client";

import React from "react";
import "dotenv/config";

import { SharedWorkerCarrier } from "@/utils/workers";
import { handleWorkerEvent } from "@/utils/auxil/socketWorkerTasks";
import { SocketWorkerEvent } from "@/utils/workers/types/workers.types";
import { type ContextData } from "@/providers/SocketProvider/SocketProvider.types";

export const SocketContext: React.Context<ContextData> = React.createContext({
  send: () => {},
  signals: [""],
  rates: "",
  setRates: (() => {}) as ContextData['setRates'],
});

export default function WebSocket({ children }: { children: React.ReactNode }) {
  const [signals, setSignals] = React.useState<Array<string>>([]);
  const [rates, setRates] = React.useState<string>("");
  const [carrier, setCarrier] = React.useState<SharedWorkerCarrier>({ worker: null, id: null });

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
              break;
            }
            // Update signals
            break;
          }
          case 'string': {
            setSignals([...signals, e.data]);
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
      port.postMessage(rates);
      setRates("");
    }
  }

  return (
    <SocketContext.Provider 
      value={{ 
        send: sendMsg,
        signals,
        rates, setRates
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

