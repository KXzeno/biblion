import { cookies as getCookies } from "next/headers";
import { Prisma } from "@prisma/client";

import getWordData, { makeWellFormed } from "@/utils/auxil/getWordData";
import db from "../../../prisma/db";

/**
 * @remarks
 *
 * To be used
*/
enum RateLimitActivation {
  ON = 'The client is being rate limited',
  OFF = 'The client received an inbound request',
}

/**
 * @remarks
 *
 * Use cookie to avoid queries when reaching limits
 *
 * To be used
 */
export async function GET(req: Request) {
  // TODO: Cache ip addresses for rate limiting
  const isRateLimited = false;

  const headers = req.headers.entries();
  const client = headers.find(header => header[0] === 'x-forwarded-for');

  let clientIp;

  if (client) {
    clientIp = client[1];
  }

  const cookies = await getCookies();

  let r = cookies.has('rates') ?
    cookies.get('rates') : null;

  let origin: Prisma.OriginCreateInput;

  if (r === null || r === undefined || (r && !(r.value.length > 0))) {
    if (clientIp === undefined) {
      throw new Error('Client IP not found.');
    }

    origin = { 
      id: clientIp,
      updatedAt: new Date(),
    };

    const createOrigin = db.origin.create({ data: origin });

    cookies.set("rates", (await createOrigin.then(res => res.id)) as string);
    r = cookies.get('rates');
  } 

  if (r === undefined) {
    throw new Error('An error occurred during origin retrieval');
  }

  const rate = Number.parseInt(r.value);

  cookies.set("rates", `${rate + 1}`);

  const msg = isRateLimited ? RateLimitActivation.ON : RateLimitActivation.OFF;

  const parts = makeWellFormed([`${msg}:${rate}`]);
  const blob = new Blob(parts, { type: 'text/plain' });

  return new Response(blob);
}

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
