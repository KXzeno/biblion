"use client";

import React from "react";
import "dotenv/config";

import ColligateWebSocket from "@/utils/core/WebSockets";
import { SocketContext } from "@/providers/SocketProvider";

export default function WebSocket() {
  const { send, signals, rates, setRates } = React.useContext(SocketContext);

  return (
    <div>
      <h1>STOMP WebSocket</h1>
      <input 
        type="text"
        placeholder="Enter num"
        value={rates}
        onChange={(e) => {
          setRates(e.target.value);
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
