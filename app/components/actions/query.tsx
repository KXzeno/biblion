'use server';

// import { z } from "zod";
// import { redirect } from "next/navigation";

/**
 * Server action for handling word querying form responses
 *
 * @param formData - the form data retrieved by user's input
 * @param prevState - the previous / default state returned by this action
 *
 * @returns the newer state of this action
 */
export async function queryWord(prevState: { msg: string, similar: string[], rawData: object[] }, formData: FormData): Promise<typeof prevState> {
  // Parses for the input with the name attribute 'word'
  const word = formData.get('word');

  // Add safeguard and predicate
  if (!isWord(word)) {
    throw new Error('Null input.');
  }

  // Assert type as string

  // Initialize querying status for validation
  let success = true as boolean; // without type assertion, it is a literal(?)

  // Validate the user's input for queryable characters
  const isValid = validateWord(word);

  // Remove trailing whitespace


  // Return an object with customized raw data if invalid
  if (isValid === false) {
    return {
      msg: '',
      similar: [],
      rawData: [
        { 
          target: word ? word : '',
          error: word ? `"${word}" has invalid characters` : 'Invalid input.'
        }
      ]
    };
  }

  // Send a request in local endpoint for querying word data
  const wordData = await fetch('https://biblion.karnovah.com/api/v1', {
    method: 'POST',
    body: JSON.stringify(word),
  }).then(res => { 
    return res.json();
  }).catch(() => {
    // On querying failure, update success
    success = false
  });

  // Raw data should only be defined at this stage if a custom error is known
  if (Object.keys(wordData).includes('rawData')) {
    return wordData;
  }

  // Intentionally, the 'success' reference only exists if an unknown
  // server-side error had occured, however if it becomes relevant,
  // return custom rawData that's indicative of this exception
  if (success === false) {
    return { 
      msg: '',
      similar: [],
      rawData: [{ target: '', error: 'Something wrong had occurred in the server.' }],
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
      similar: wordData.filter((word: string) => typeof word === 'string'),
      rawData: [{ target: word }, ...wordData],
    };
  }

  // At this stage, the request is unexceptionally fulfilled
  return { 
    msg: ``,
    similar: wordData.filter((word: string) => typeof word === 'string'),
    rawData: [{ target: word }, ...wordData],
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

function isWord(word: string | FormDataEntryValue | null): word is string {
  return word !== null ? true : false;
}
