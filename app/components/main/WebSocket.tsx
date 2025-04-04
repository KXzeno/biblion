"use client";

import React from "react";
import "dotenv/config";

import { SocketContext, SocketDispatchContext } from "@/providers/SocketProvider";
import { ActionType } from "../providers/SocketProvider/SocketProvider.types";

export default function WebSocket() {
  const { send, signals, rates, client, sendFromProxy, pendingSignal } = React.useContext(SocketContext);
  const { dispatch } = React.useContext(SocketDispatchContext);
  const [ supportsSharedWorker, setSupportsSharedWorker ] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (client !== null && client.initialized) {
      sendFromProxy();
    }
  }, [pendingSignal]);

  React.useEffect(() => {
    if (!(typeof window === 'undefined')) {
      if (!!window.SharedWorker) {
        setSupportsSharedWorker(true);
      }
    }
  }, []);

  return (
    <div>
      <h1>{`SHARED WORKER IS ${(supportsSharedWorker) ? 'SUPPORTED' : 'NOT SUPPORTED'}`}</h1>
      <h1>STOMP WebSocket{client !== null ? ' CONNECTED' : ''}</h1>
      <input 
        type="text"
        placeholder="Enter num"
        value={rates}
        onChange={(e) => {
          dispatch({ type: ActionType.Rate, payload: { rates: e.target.value } });
        }}
      />
      <button 
        onClick={send}
      >
        Send
      </button>
      <div>
        <h2>Signals</h2>
        <ul>
          {signals.map((signal, index) => {
            return <li key={index}>{signal}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
