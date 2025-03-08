import React from 'react';
import { cookies as getCookies } from 'next/headers';

import Dictionary from '@/components/main/Dictionary';

export default async function WordPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const cookies = await getCookies();

  const query = cookies.has('query') ? cookies.get('query')!.value : null;

  if (query !== null) {
    if (query === slug) {
      // TODO: Validate 
    }
  }

  return (
    <Dictionary word={slug} />
  );
}

