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

/**
 * The core component for the dynamic dictionary route
 *
 * @param { term } - the slug or word
 * @returns a component utilizing the mapped server-queried data
 */
export default function Term({ term }: { term: string }): React.ReactNode {
  // Initialize state for storing the data parsed by DictionaryEntryParser class
  const [parsedNodes, setParsedNodes] = React.useState<ParsedPayload | null>(null);

  // Initialize state for when payload is successfully parsed
  const [payloadParsed, setPayloadParsed] = React.useState<boolean>(false);

  // Extract reducer state
  const useDefinitionsContext = () => React.useContext(DefinitionsContext);
  const { reducState } = useDefinitionsContext();

  // Extract dispatcher state
  const useDefinitionsDispatchContext = () => React.useContext(DefinitionsDispatchContext);
  const { dispatch } = useDefinitionsDispatchContext();

  React.useEffect(() => {
    // Retrieve encoded server-queried data
    /** Session storage approach */
    const defsString = window.sessionStorage.getItem('injected');

    // Terminate parsing logic if data is null
    if (defsString === null) {
      return;
    }

    // Parse data as JSON
    const defs = JSON.parse(defsString);

    // Update raw data with parsed definitions
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

    // Parse the raw data array and update nodes and payload state
    const parsed = DictionaryEntryParser.parse(reducState.rawData as Payload[]);
    setParsedNodes(parsed as ParsedPayload);
    setPayloadParsed(true);
  }, [payloadParsed]);

  return (
    <>
      { /* Map parsed nodes to elements, otherwise default to fallback */ }
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

