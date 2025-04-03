'use server';

import React from "react";

import WebSocket from "@/main/WebSocket";

import SocketProvider from "@/components/providers/SocketProvider";

export default async function Page() {
  const { C_ENDPOINT, C_DESTINATION , C_BROADCAST, DISCORD_WH_ENDPOINT } = process.env;

  return (
    <SocketProvider 
      ColligateWebSocketConstructorParams={{
        C_ENDPOINT,
        C_DESTINATION,
        C_BROADCAST,
      }}
      DISCORD_WH_ENDPOINT={DISCORD_WH_ENDPOINT}
    >
      <WebSocket />
    </SocketProvider>
  );
};
