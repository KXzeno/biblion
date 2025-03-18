import SearchInputHandler from '../core/SearchInputHandler';
import { ResponseData, ErroneousResponse, SuccessfulResponse } from '../../components/actions/types/query.types';

/**
* A direct query initiated directly by 
* HTTP requests during cache invalidation
*
* @param word - the word to query after invalidation
* @returns a JSON object of definitions when fulfilled,
* else an erroneous JSON response
*/
export default async function manualQuery(word: string): Promise<SuccessfulResponse> {
  let success: boolean = false as boolean;
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
