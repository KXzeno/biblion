import React from "react";

import WebSocket from "@/main/WebSocket";

import SocketProvider from "@/components/providers/SocketProvider";

export default function Page() {
  return (
    <SocketProvider>
      <WebSocket />
    </SocketProvider>
  );
};
