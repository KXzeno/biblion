import type { ResponseData, ErroneousResponse, PendingResponse } from "@/components/actions/types/query.types";
import type { InputResponseOptions } from './types/ActionResponse.types';

export default class SearchInputHandler {
  constructor() {

  }

  /**
   * Utility function to validate input from form data
   *
   * @param word - the word to validate
   * @returns true if only containing word
   * characters and hiphens, otherwise false
   */
  public static validateWord(word: string): boolean {
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

  /**
   * Remove trailing whitespace
   *
   * @param str - the string to remove trailers
   * @returns the modified string
   */
  public static removeTrails(str: string): string {
    const trimmed = str.replaceAll(/(?<![a-zA-Z])\s{0,}/g, '');
    return trimmed;
  }

  /**
   * Wraps invalid characters with 
   * angle brackets to mark for mapping
   *
   * @param str - the invalid string to mark
   * @returns the marked string
   */
  public static markForAlteration(str: string): string {
    const transformed = str.replaceAll(/((?!\-|\s)[\W\d]+?|\-{1,})/g, '<$1>');
    return transformed;
  }

  /**
   * Type predicator for form entry
   *
   * @param word - the word to predicate
   * @returns a boolean causing type narrowing of Form | null or string
   */
  public static isWord(word: string | FormDataEntryValue | null): word is string {
    return word !== null ? true : false;
  }

  /**
   * Type predicator for early terminated response
   *
   * @param word - the data to predicate
   * @returns a boolean causing type narrowing of SuccessfulResponse and ErroneousResponse
   */
  public static isTerminatedEarly(data: ResponseData | ErroneousResponse): data is ErroneousResponse  {
    return !(data instanceof Array);
  }

  /**
   * Creates a response returned by the query server action
   *
   * @returns a successful or erroneous response
   */
  public static createResponse(word: string, options?: InputResponseOptions): PendingResponse {
    if (options) {
      let selectedOptions: Array<[string, boolean]> = [];

      for (const [key, val] of Object.entries(options)) {
        selectedOptions.push([key as string, val as boolean]);
      }

      selectedOptions = selectedOptions.filter(option => option[0] !== 'data' && option[1] === true);

      if (selectedOptions.length > 1) {
        throw new Error('Cannot enforce non-singular instructions.');
      }

      switch (selectedOptions[0][0]) {
        case 'invalid': {
          return {
            msg: '',
            similar: [] as string[],
            rawData: [
              {
                target: word,
                error: `"${word}" has invalid characters`,
              },
            ],
          };
        }
        case 'error': {
          return {
            msg: word.toLowerCase(),
            similar: [] as string[],
            rawData: [
              {
                target: word,
                error: 'Something occurred in the server.',
              },
            ],
          };
        }
        case 'unacknowledged': {
          if (!options.data) {
            throw new Error('Data is required for this parameter');
          }
          return {
            msg: word.toLowerCase(),
            similar: options.data.filter((word: object | string) => typeof word === 'string'),
            rawData: [ { target: word }, ...options.data ],

          };
        }
        case 'successful': {
          if (!options.data) {
            throw new Error('Data is required for this parameter');
          }
          return { 
            msg: '',
            similar: options.data.filter((word: object | string) => typeof word === 'string'),
            rawData: [{ target: word }, ...options.data],
          };
        }
      }
    }
    return {
      msg: word.toLowerCase(),
      similar: [] as string[],
      rawData: [{}],
    } as ErroneousResponse;
  } 
}
