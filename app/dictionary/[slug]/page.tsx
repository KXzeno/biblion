import React from 'react';

import DictionaryPage from '@/components/main/DictionaryPage';
import DefinitionsProvider from '@/components/providers/DefinitionsProvider';

export default async function WordPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  return (
    <DictionaryPage word={slug} />
  )
}

