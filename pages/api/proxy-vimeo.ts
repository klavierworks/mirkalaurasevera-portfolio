export const runtime = 'edge';

export default async function handler(req: Request) {
  const nextUrl = req.url ? new URL(req.url) : null;
  if (!nextUrl) {
    return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
  }
  const url = nextUrl?.searchParams.get('url');

  if (!url || typeof url !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid URL parameter' }), { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new Response(JSON.stringify({ url, error: 'Failed to fetch data', status: response.status, statusText: response.statusText, response: await response.text() }), { status: response.status });
    }

    // Forward the headers from the Vimeo response
    return new Response(await response.text(), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
