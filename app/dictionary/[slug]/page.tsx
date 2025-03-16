import React from 'react';
import { cookies as getCookies } from 'next/headers';

import Dictionary from '@/components/main/Dictionary';
import manualQuery from '@/utils/auxil/fallbackQuery';

export default async function WordPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const cookies = await getCookies();

  const query = cookies.has('query') ? cookies.get('query')!.value : null;
  let tempData;

  if (query !== null && query !== slug) {
    // TODO: Invalidate erroneous responses
    tempData = await manualQuery(slug).then(res => res.rawData);
  }

  return (
    <Dictionary word={slug} tempData={tempData || null} />
  );
}

