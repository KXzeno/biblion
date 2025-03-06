/**
 * @remarks
 *
 * To be used
enum RateLimitActivation {
  ON = 'The client is being rate limited',
  OFF = 'The client received an inbound request',
}
*/

function makeWellFormed(parts: Array<string>) {
  const newParts = parts.map(part => part.toWellFormed());
  return newParts;
}

async function getWordData(word: string): Promise<unknown[] | null> {
  const apiKey = process.env.API_KEY;
  const dictionaryEndpoint = process.env.ENDPOINT;

  const req = `${dictionaryEndpoint}${word}?key=${apiKey}`;

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

export async function POST(req: Request): Promise<Response> {
  const word = await req.json();
  const part = await getWordData(word);

  if (part === null) {
    return new Response(new Blob(makeWellFormed(['INVALID'])), { status: 400, statusText: 'Invalid Input' });
  }

  return Response.json(part);
}
