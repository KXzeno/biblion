import React from 'react';

import Dictionary from '@/components/main/Dictionary';

export default async function WordPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  return (
    <Dictionary word={slug} />
  );
}

