'use client';

import React from 'react';

import { 
  type ContextData,
  type DispatchContextData,
} from './DefinitionsProvider.types';

import { queryWord } from '@/actions/query';
// import DictionaryEntryParser, { type Payload } from '@/utils/core/DictionaryEntryParser';
import type { SearchBarReducState, SearchBarReducAction } from '@/components/forward/navigation';
import { ActionType, PayloadStatus } from '@/forward/navigation/SearchBar/SearchBar.types';
import { PendingResponse } from '@/components/actions/types/query.types';

// Initialize definitions context
export const DefinitionsContext: React.Context<ContextData> = React.createContext({
  formState: { 
    msg: '',
    similar: [] as string[],
    rawData: [] as object[],
  } as PendingResponse,
  formAction: (() => null) as (payload: FormData) => void,
  reducState: { 
    input: '' as string,
    CLIENT_CACHE: [] as string[],
    rawData: [] as object[],
    status: PayloadStatus.INACTIVE as PayloadStatus
  },
  formStatePending: false as boolean,
});

// Initialize definitions dispatcher context
export const DefinitionsDispatchContext: React.Context<DispatchContextData> = React.createContext({
  dispatch: (() => null) as React.ActionDispatch<[SearchBarReducAction]>,
})

const searchBarReducDefaults = { 
  input: '' as string, 
  CLIENT_CACHE: [] as string[], 
  rawData: [] as object[],
  status: PayloadStatus.INACTIVE as PayloadStatus,
}

/**
 * Reducer function for defintions dispatcher
 *
 * @param state - the reducer state
 * @param action - the reducer action
 * @returns the new state when called
 */
function reducer(state: SearchBarReducState, action: SearchBarReducAction): typeof state {
  switch (action.type) {
    case ActionType.Query: {
      // Validate payload 
      if (!action.payload) {
        return { ...state, input: '', status: PayloadStatus.FAILED }
      }

      // Return queried data if any, append to cache, 
      // and signal success for parsed payload
      return { 
        input: '',
        CLIENT_CACHE: [...state.CLIENT_CACHE as string[], state.input], 
        rawData: action.payload.rawData,
        status: typeof action.payload.rawData[0] === 'string' ?
          PayloadStatus.SUCCESS :
          PayloadStatus.FAILED,
      };
    }
    case ActionType.Input: {
      // Validate payload 
      if (!action.payload) {
        return { ...state };
      }

      // Update the value for the form input
      return { ...state, input: action.payload.input };
    }
    case ActionType.Revalidate: {
      // Validate payload 
      if (state.status === PayloadStatus.INACTIVE) {
        return { ...state };
      }
      return searchBarReducDefaults;
    }
    case ActionType.Inject: {
      // Validate payload 
      if (!action.payload) {
        throw new Error('No payload to parse.');
      }
      // Inject payload when externally queried
      return { ...state, rawData: action.payload.rawData };
    }
    default: return { ...state };
  }
}

/**
 * Definitions provider component
 *
 * @param { children } - the React elements the provider wraps
 * @returns a provider component for definitions
 */
export default function DefinitionsProvider({ children }: React.ComponentProps<'div'>): React.ReactNode {
  const [formState, formAction, formStatePending ] = React.useActionState(queryWord, { msg: '', similar: [] as string[], rawData: [] as object[] } as PendingResponse);

  const [reducState, dispatch] = React.useReducer<SearchBarReducState, [SearchBarReducAction]>(reducer, searchBarReducDefaults);

  return (
    <DefinitionsContext.Provider value={{ formState, formAction, reducState, formStatePending }}>
      <DefinitionsDispatchContext.Provider value={{ dispatch }}>
        {children}
      </DefinitionsDispatchContext.Provider>
    </DefinitionsContext.Provider>
  )
}

