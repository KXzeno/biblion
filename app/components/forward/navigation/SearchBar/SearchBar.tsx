'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        dispatch({ type: ActionType.Revalidate });
        dispatch({ type: ActionType.Inject, payload: { ...reducState, rawData: [target] as object[] } });
        setIsInvalidInput(true);
        return;
      }
      // Cease router logic and show similar field
      return;
    }

    // Check if queried data only returned similar matches
    if (typeof formState.rawData[1] !== 'string') {
      // Inject payload with the similar fields to process in JSX
      /** State is not restored due to disparate component trees */
      dispatch({ type: ActionType.Revalidate });
      dispatch({ type: ActionType.Inject, payload: { ...reducState, rawData: formState.rawData as object[]} });

      // Parse and remove first element, a custom object, that stores the form input
      const word = Object.values(formState.rawData[0])[0].toLowerCase();
      formState.rawData.shift();

      /** 
       * Hybrid session storage and cookies approach 
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
    }
  }, [formState.rawData]);

  return (
    <div className='search-bar-ctr'>
      <div className='form-ctr'>
        <form 
          action={formAction} 
          onSubmit={(e) => {
            // Revalidate invalid input
            setIsInvalidInput(false);
            dispatch({ type: ActionType.Revalidate });
            dispatch({ type: ActionType.Query, payload: { ...reducState, input: reducState.input } });
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
                      <Link href={`/dictionary/${pot}`}>{pot}</Link>
                    </p>
                  );
                })}
                </div>
              </> :
              <p>
                { /* Color code invalid chars via transform */ }
                {((data: { target: string, error: string }): React.ReactNode => {

                  // Match the quoted string which is user input
                  console.log(data, isInvalidInput);
                  const parsedWordMatch = data.error.match(/(?:\")(.+)(?:\")/);

                  // Throw error when server failed to return input
                  if (parsedWordMatch === null) {
                    throw new Error('Input missing');
                  }

                  // Matched pattern on non-global expressions are in 2nd index, else first 
                  const invalidInput = parsedWordMatch[1];

                  /** 
                   * Create RegExp match iterator that matches 
                   * invalid characters, parsed by enclosed diamonds
                   *
                   * @example <.>, <*>, <!> 
                   */
                  const invalidMatchesIterator = invalidInput.matchAll(/(?:\<)(.+?)(?:\>)/g);

                  // Initialize index for comparisons in iterator logic
                  let recentUsedIndex = 0;

                  // Initialize array holding strings signifying 
                  // altering states, later converted to a React node
                  let cleaved: Array<{ str: string, alter: boolean } | React.ReactNode> = [];

                  // Start iterator and loop until complete
                  let next = invalidMatchesIterator.next();

                  while (next.done === false) {
                    const value = next.value[0];

                    const index = next.value.index;


                    // Index mismatch indicates missing partial strings
                    if (index !== recentUsedIndex) {
                      // Manually insert unchecked partial string and update recent index
                      cleaved.push({ str: invalidInput.slice(recentUsedIndex, index), alter: false });
                      recentUsedIndex = index;
                    }
                    // Insert alterable string and update recent index
                    cleaved.push({ str: invalidInput.slice(recentUsedIndex, index + value.length), alter: true });
                    recentUsedIndex += value.length;

                    // Traverse iterator
                    next = invalidMatchesIterator.next();

                    if (next.done === true) {
                      // If iterator reached end with index mismatch, manually insert unchecked string
                      if (recentUsedIndex - value.length === invalidInput.length) {
                        return;
                      }
                      cleaved.push({ str: invalidInput.slice(recentUsedIndex), alter: false });
                    }
                  }

                  // Map each cleaved object to an element differing by their alterable states
                  cleaved = (cleaved as Array<{str: string, alter: boolean}>).map((slice, i) => {
                    if (slice.alter) {
                      return <span key={`invalid-field:${slice.str}-${i}`} className='invalid-field'>{slice.str.slice(1, slice.str.length - 1)}</span>;
                    }
                    return <span key={`valid-field:${slice.str}-${i}`}>{slice.str}</span>;
                  }) as React.ReactNode[];

                  return <><>{'"'}</>{[...cleaved]}<>{'"'}</> contains invalid characters.</> as React.ReactNode;
                })(formState.rawData[0] as { target: string, error: string })}
              </p>}
          </div>
        </div>
        }
      </>
    </div>
  );
}
