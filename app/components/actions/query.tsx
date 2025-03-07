'use server';

// import { z } from "zod";
// import { redirect } from "next/navigation";

import type { SuccessfulResponse, ErroneousResponse, PendingResponse, ResponseData } from "./types/query.types";
import SearchInputHandler from "@/utils/core/SearchInputHandler";

/**
 * Server action for handling word querying form responses
 *
 * @param formData - the form data retrieved by user's input
 * @param prevState - the previous / default state returned by this action
 *
 * @returns the newer state of this action
 */
export async function queryWord(prevState: PendingResponse, formData: FormData): Promise<typeof prevState> {
  // Parses for the input with the name attribute 'word'
  let word = formData.get('word');

  // Add safeguard and predicate
  if (!SearchInputHandler.isWord(word)) {
    throw new Error('Null input.');
  }

  // Initialize querying status for validation
  let success = true as boolean; // without type assertion, it is a literal(?)

  // Validate the user's input for queryable characters
  const isValid = SearchInputHandler.validateWord(word);

  // Remove trailing whitespace
  word = SearchInputHandler.removeTrails(word);

  // Return an object with customized raw data if invalid
  if (isValid === false) {
    // Transform invalid characters for consumer-side manipulation
    word = SearchInputHandler.markForAlteration(word);

    return SearchInputHandler.createResponse(word, { invalid: true });
  }

  // Send a request in local endpoint for querying word data
  const wordData: ResponseData | ErroneousResponse = await fetch('https://biblion.karnovah.com/api/v1', {
    method: 'POST',
    body: JSON.stringify(word),
  }).then(async res => { 
    // Returns status code 200 but could be zero data
    return res.json().then((defs: object[]) => {
      // If no data retrieved, mark unsuccessful
      if (defs.length < 1) {
        success = false;
        return SearchInputHandler.createResponse(word) as ErroneousResponse;
      }
      return defs;
    });
  }).catch(() => {
    // On querying failure, update success
    success = false
    return SearchInputHandler.createResponse(word, { error: true }) as ErroneousResponse;
  });

  // Predicate type and termiante early on code 200 w/ empty array
  if (SearchInputHandler.isTerminatedEarly(wordData)) {
    // Throw error if terminating a successful response
    if (success === true) {
      throw new Error('Payload was marked successful but terminated early.');
    }
    return wordData;
  }

  /** 
   * No custom error suggests that the API is successful but 
   * only returned similar inputs, which is implicitly represented
   * by the data type of the first element in the response
   */
  if (typeof wordData[0] === 'string') {
    return SearchInputHandler.createResponse(word, { data: wordData, unacknowledged: true }) as SuccessfulResponse;
  }

  // At this stage, the request is unexceptionally fulfilled
  // Msg must remain empty to avoid erroneous checks
  return SearchInputHandler.createResponse(word, { data: wordData, successful: true }) as SuccessfulResponse;
  // redirect(`/dictionary/${word.toLowerCase()}`);
}
