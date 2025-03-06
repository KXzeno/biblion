'use client';

import React from 'react';
// import { useRouter } from 'next/navigation';

import DictionaryEntryParser from '@/utils/core/DictionaryEnteryParser';

import { 
  DefinitionsContext,
  DefinitionsDispatchContext
} from '@/providers/DefinitionsProvider';
import { ActionType } from '@/forward/navigation/SearchBar/SearchBar.types';
import type { Payload, ParsedPayload } from '@/utils/core/DictionaryEnteryParser';

export default function Term({ term }: { term: string }): React.ReactNode {
  const [parsedNodes, setParsedNodes] = React.useState<ParsedPayload | null>(null);
  const [payloadParsed, setPayloadParsed] = React.useState<boolean>(false);
  // const router = useRouter();

  const useDefinitionsContext = () => React.useContext(DefinitionsContext);
  const { reducState } = useDefinitionsContext();

  const useDefinitionsDispatchContext = () => React.useContext(DefinitionsDispatchContext);
  const { dispatch } = useDefinitionsDispatchContext();

  React.useEffect(() => {
    /** Session storage approach */
    const defsString = window.sessionStorage.getItem('injected');

    if (defsString === null) {
      return;
    }

    const defs = JSON.parse(defsString);

    dispatch({ type: ActionType.Inject, payload: { ...reducState, rawData: defs } });

    /** @ignore
     *
     * Search params approach
     *
     * const getSearchParams = new URLSearchParams(window.location.search);
     * const encodedDefs = getSearchParams.get('defs') as string;
     * const defs = JSON.parse(decodeURI(encodedDefs));
     * router.replace(window.location.href.replaceAll(/(?<=\?)[\?\S\s]+/g, ''));
     * dispatch({ type: ActionType.Inject, payload: { ...reducState, rawData: defs } });
     * console.log(defs);
     * console.log(reducState.rawData);
     */
    const parsed = DictionaryEntryParser.parse(reducState.rawData as Payload[]);
    setParsedNodes(parsed as ParsedPayload);
    setPayloadParsed(true);
  }, [payloadParsed]);

  return (
    <>
      { 
        parsedNodes !== null ? 
          parsedNodes.map(nodes => {
          const arr: React.ReactNode[] = [];
          nodes.defs.forEach(node => {
            // FIXME: Not supposed to be conditional; means
            // there are unparsed values. Check parser class
            // to handle untyped senses such as "sseq" and
            // unchecked labels such as "snote"
            if (!(node[1] instanceof Array)) {
              // FIXME: Object with keys 'cats' and 'intro' are
              // read in the iterable. Must refactor parser
              if (Object.keys(node[1] as object).includes('props')) {
                arr.push(node[1]);
              }
            }
          });
          return arr;
        }) : term
      }
    </>
  )
}

