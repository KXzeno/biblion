'use server';

// import { z } from "zod";
// import { redirect } from "next/navigation";

import type { SuccessfulResponse, ErroneousResponse } from "./types/query.types";

/**
 * Server action for handling word querying form responses
 *
 * @param formData - the form data retrieved by user's input
 * @param prevState - the previous / default state returned by this action
 *
 * @returns the newer state of this action
 */
export async function queryWord(prevState: SuccessfulResponse | ErroneousResponse, formData: FormData): Promise<typeof prevState> {
  // Parses for the input with the name attribute 'word'
  let word = formData.get('word');

  // Add safeguard and predicate
  if (!isWord(word)) {
    throw new Error('Null input.');
  }

  // Initialize querying status for validation
  let success = true as boolean; // without type assertion, it is a literal(?)

  // Validate the user's input for queryable characters
  const isValid = validateWord(word);

  // Remove trailing whitespace
  word = removeTrails(word);

  // Return an object with customized raw data if invalid
  if (isValid === false) {
    // Transform invalid characters for consumer-side manipulation
    word = markForAlteration(word);

    return {
      msg: '',
      similar: [],
      rawData: [
        { 
          target: word,
          error: `"${word}" has invalid characters`
        }
      ]
    };
  }

  // Send a request in local endpoint for querying word data
  const wordData: SuccessfulResponse | ErroneousResponse = await fetch('https://biblion.karnovah.com/api/v1', {
    method: 'POST',
    body: JSON.stringify(word),
  }).then(async res => { 
    // Returns status code 200 but could be zero data
    return res.json().then((defs: SuccessfulResponse) => {
      // If no data retrieved, mark unsuccessful
      if (defs.length < 1) {
        success = false;
      }
      return defs;
    });
  }).catch(() => {
    // On querying failure, update success
    success = false
    return { 
      msg: `${word.toLowerCase()}`,
      similar: [] as string[],
      rawData: [{ target: word, error: 'Something occurred in the server.'}],
    } as ErroneousResponse;
  });

  console.log(success);

  // Predicate type and termiante early on code 200 w/ empty array
  if (isTerminatedEarly(wordData)) {
    // Throw error if terminating a successful response
    if (success === true) {
      throw new Error('Payload was marked successful but terminated early.');
    }
    return { 
      msg: word,
      similar: [] as string[],
      rawData: [{}],
    };
  }

  /** 
   * No custom error suggests that the API is successful but 
   * only returned similar inputs, which is implicitly represented
   * by the data type of the first element in the response
   */
  if (typeof wordData[0] === 'string') {
    return { 
      msg: `${word.toLowerCase()}`,
      similar: wordData.filter((word: object | string) => typeof word === 'string'),
      rawData: [{ target: word }, ...wordData as Omit<SuccessfulResponse, string>[]],
    };
  }

  // At this stage, the request is unexceptionally fulfilled
  return { 
    msg: word,
    similar: wordData.filter((word: object | string) => typeof word === 'string'),
    rawData: [{ target: word }, ...wordData as Omit<SuccessfulResponse, string>[]],
  };
  // redirect(`/dictionary/${word.toLowerCase()}`);
}

/**
 * Utility function to validate input from form data
 *
 * @param word - the word to validate
 * @returns true if only containing word
 * characters and hiphens, otherwise false
 */
function validateWord(word: string): boolean {
  let onlyHiphensHaveMatched = true;

  const matchIterator = word.matchAll(/[\W]/g);

  for (const matchArr of matchIterator) {
    const matched = matchArr[0];

    if (matched === '-') {
      onlyHiphensHaveMatched = true; 
    } else if (onlyHiphensHaveMatched) {
      onlyHiphensHaveMatched = false;
    }
  }
  return onlyHiphensHaveMatched;
}

function removeTrails(str: string): string {
  const trimmed = str.replaceAll(/(?<![a-zA-Z])\s{0,}/g, '');
  return trimmed;
}

function markForAlteration(str: string): string {
  const transformed = str.replaceAll(/((?!\-|\s)[\W\d]+?|\-{1,})/g, '<$1>');
  return transformed;
}

/**
 * Type predicator for form entry
 *
 * @param word - the word to predicate
 * @returns a boolean causing type narrowing of Form | null or string
 */
function isWord(word: string | FormDataEntryValue | null): word is string {
  return word !== null ? true : false;
}

/**
 * Type predicator for early terminated response
 *
 * @param word - the data to predicate
 * @returns a boolean causing type narrowing of SuccessfulResponse and ErroneousResponse
 */
function isTerminatedEarly(data: SuccessfulResponse | ErroneousResponse ): data is ErroneousResponse  {
  return !(data instanceof Array);
}
