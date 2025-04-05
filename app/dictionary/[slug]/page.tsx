import React from 'react';
import { cookies as getCookies } from 'next/headers';

import Dictionary from '@/components/main/Dictionary';
import manualQuery from '@/utils/auxil/fallbackQuery';
import { SocketProvider } from '@/providers';

export default async function WordPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const cookies = await getCookies();
  const { C_ENDPOINT, C_DESTINATION , C_BROADCAST, DISCORD_WH_ENDPOINT } = process.env;

  const query = cookies.has('query') ? cookies.get('query')!.value : null;
  let tempData;

  if (query !== null && query !== slug) {
    // TODO: Invalidate erroneous responses
    tempData = await manualQuery(slug).then(res => res.rawData);
  }

  return (
    <SocketProvider 
      ColligateWebSocketConstructorParams={{
        C_ENDPOINT,
        C_DESTINATION,
        C_BROADCAST,
      }}
      DISCORD_WH_ENDPOINT={DISCORD_WH_ENDPOINT}
    >
      <Dictionary word={slug} tempData={tempData || null} />
    </SocketProvider>
  );
}

