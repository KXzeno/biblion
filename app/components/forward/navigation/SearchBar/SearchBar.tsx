'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { DefinitionsContext, DefinitionsDispatchContext } from '@/providers/DefinitionsProvider';
import { ActionType } from './SearchBar.types';
import './SearchBar.css';

/**
 * A search bar component for the landing page
 *
 * @returns a forward component
 */
export default function SearchBar(): React.ReactNode {
  // Extract relevant states from context
  const { formState, reducState, formAction, formStatePending } = React.useContext(DefinitionsContext);
  const { dispatch } = React.useContext(DefinitionsDispatchContext);

  // Set state for input invalidation
  const [isInvalidInput, setIsInvalidInput] = React.useState<boolean>(false);

  // Initialize router on "fully" valid inputs
  const router = useRouter();

  React.useEffect(() => {
    // Raw data may have a custom object detailing an error
    if (formState.rawData.length < 2) {
      const target = formState.rawData[0];

      // Check if the lone data value is a custom error object
      if (target instanceof Object && Object.keys(target).includes('error')) {
        // Inject the error object and update invalid state
        dispatch({ type: ActionType.Inject, payload: { ...reducState, rawData: [target] as object[] } });
        setIsInvalidInput(true);
        return;
      }
      // Cease router logic and show similar field
      return;
    }

    // Update invalid state if previously toggled
    if (isInvalidInput === true && !Object.keys(formState.rawData[0]).includes('error')) {
      setIsInvalidInput(false);
    }

    // Check if queried data only returned similar matches
    if (typeof formState.rawData[1] !== 'string') {
      // Inject payload with the similar fields to process in JSX
      /** State is not restored due to disparate component trees */
      dispatch({ type: ActionType.Inject, payload: { ...reducState, rawData: formState.rawData } });

      // Parse and remove first element, a custom object, that stores the form input
      const word = Object.values(formState.rawData[0])[0].toLowerCase();
      formState.rawData.shift();

      /** 
       * Session storage approach 
       *
       * @remarks
       *
       * Carrying data via session storage goes against the logic
       * for manual HTTP requests, however since this route is a
       * separate component tree, cross-state management proved
       * difficult for me to achieve. Using this approach removes 
       * the need for a separate API call when rerouting; consequently,
       * the session storage must be used to validate synchronisity
       * within manual HTTP requests, otherwise it will show stale data.
       *
       * @example
       * ```
       * const encoded = JSON.parse(window.sessionStorage.get('injected'));
       * // Assumes first element contains an element for validation
       * if (encoded[0].target !== slug) {
       *    // ... alternative validation logic
       * }
       * ```
       */
      window.sessionStorage.setItem("injected", JSON.stringify(formState.rawData));
      router.push(`/dictionary/${word}`);

      /** @ignore 
       *
       * Search params approach 
       *
       * const queryString = `${encodeURIComponent(JSON.stringify(formState.rawData))}`
       * router.push(`/dictionary/${word}?defs=${queryString}`);
       */
    }
  }, [formState.rawData]);

  return (
    <div className='search-bar-ctr'>
      <div className='form-ctr'>
        <form 
          action={formAction} 
          onSubmit={(e) => {
            dispatch({ type: ActionType.Query, payload: { ...reducState, input: reducState.input } });
            dispatch({ type: ActionType.Invalidate });
            e.stopPropagation();
          }}
        >
          <input
            placeholder='Search a word'
            name='word'
            value={reducState.input}
            onChange={(e) => {
              dispatch({
                type: ActionType.Input,
                payload: { ...reducState, input: e.target.value },
              });
            }}
            className='word-input'
            autoComplete='off'
            disabled={formStatePending}
          />
        </form>
        {/* Show error response on input failure or unmatch */}
        {formState.msg && 
        <>
          <p className='input-unmatched'>
            {`Search for \'${formState.msg}\' failed.`}
          </p>
        </>
        }
      </div>
      <>
        {/* Show invalid error msg or grid of similar fields */}
        {(isInvalidInput || (formState.msg && formState.similar.length > 0)) && 
        <div className='similar-fields-wrapper'>
          <div className='similar-fields-ctr'>
            {isInvalidInput === false ? 
              <>
                <span>Did you mean any of:</span> 
                <div className='similar-fields-grid'>{formState.similar.map((pot: string) => {
                  return (
                    <p key={`${pot}`}>
                      {pot}
                    </p>
                  );
                })}
                </div>
              </> :
              <span>{(formState.rawData[0] as { target?: string, error?: string }).error}</span>}
          </div>
        </div>
        }
      </>
    </div>
  );
}
