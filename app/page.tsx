import Landing from "./components/main/Landing";

import { SocketProvider } from '@/providers';

export default async function Home() {
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
      <Landing />
    </SocketProvider>
  );
}
