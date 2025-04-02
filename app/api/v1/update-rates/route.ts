import "dotenv/config";

export async function POST(req: Request): Promise<Response> {
  const data = await req.json();
  const rate = Number.parseInt(data.sighted);

  let success: true | false = false;

  fetch(process.env.DISCORD_WH_ENDPOINT as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: `Disconnected, rate - ${rate}`,
    }),
  })
    .then(() => success = false)
    .catch((exc) => { 
      console.error(exc);
    });

  return Response.json({ success });
}
