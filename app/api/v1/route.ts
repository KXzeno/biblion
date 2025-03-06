/**
 * @remarks
 *
 * To be used
enum RateLimitActivation {
  ON = 'The client is being rate limited',
  OFF = 'The client received an inbound request',
}
*/

/**
 * Well-forms string inputs for blob constructions
 *
 * @param parts - an array of strings to well-form
 * @returns the parts well-formed
 */
function makeWellFormed(parts: Array<string>): Array<string> {
  const newParts = parts.map(part => part.toWellFormed());
  return newParts;
}

/**
 * Uses Merriam-Webster's dictionary API 
 * to fetch word data from a given input
 *
 * @param word - the word for endpoint
 * @returns an object conforming to Merriam's
 * data models, else null if response is 400-500
 */
async function getWordData(word: string): Promise<unknown[] | null> {
  // Reference env vars
  const apiKey = process.env.API_KEY;
  const dictionaryEndpoint = process.env.ENDPOINT;

  // Use string interpolation to construct full API URL
  const req = `${dictionaryEndpoint}${word}?key=${apiKey}`;

  // Retrieve response
  const res = await fetch(req).then(res => res.json());

  return res
}

/**
 * @remarks
 *
 * To be used
* export async function GET(req: Request) {
*   // TODO: Cache ip addresses for rate limiting
*   const isRateLimited = false;
* 
*   // const headers = req.headers.entries();
*   // const client = headers.find(header => header[0] === 'x-forwarded-for');
*   // let clientIp;
*   // if (client) {
*   //   clientIp = client[1];
*   // }
* 
*   // console.log(clientIp);
* 
*   const msg = isRateLimited ? RateLimitActivation.ON : RateLimitActivation.OFF;
* 
*   const parts = makeWellFormed([msg]);
*   const blob = new Blob(parts, { type: 'text/plain' });
* 
*   return new Response(blob);
* }
*/

/**
 * The route's post request which fetches 
 * word data and returns it as JSON, else 
 * a custom blob with an error message
 *
 * @param req - the resource request
 * @returns an awaited response containing 
 * a JSON or a blob with a custom error
 */
export async function POST(req: Request): Promise<Response> {
  // Retrieve word from request and use it to for endpoint
  const word = await req.json();
  const part = await getWordData(word);

  // If data returns null, set a custom response
  if (part === null) {
    return new Response(new Blob(makeWellFormed(['INVALID'])), { status: 400, statusText: 'Invalid Input' });
  }

  // Return awaited word data as JSON
  return Response.json(part);
}
