enum RateLimitActivation {
  ON = 'The client is being rate limited',
  OFF = 'The client received an inbound request',
}

function makeWellFormed(parts: Array<string>) {
  const newParts = parts.map(part => part.toWellFormed());
  return newParts;
}

export async function GET(req: Request) {
  // TODO: Cache ip addresses for rate limiting
  const isRateLimited = false;

  const headers = req.headers.entries();
  const client = headers.find(header => header[0] === 'x-forwarded-for');
  let clientIp;
  if (client) {
    clientIp = client[1];
  }

  console.log(clientIp);

  const msg = isRateLimited ? RateLimitActivation.ON : RateLimitActivation.OFF;

  const parts = makeWellFormed([msg]);
  const blob = new Blob(parts, { type: 'text/plain' });

  return new Response(blob);
}

