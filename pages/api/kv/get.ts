export const runtime = 'edge';

export interface Env {
  VIDEO_CACHE: any;
}

export default async function handler(request: Request, env: Env) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    const vimeoCache = await env.VIDEO_CACHE.get(key);

    if (vimeoCache === null) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return new Response(vimeoCache);
  } catch (err) {
    console.error("Error retrieving KV value:", err);

    return new Response("", {
      status: 500,
      statusText: err instanceof Error ? err.message : String(err),
    });
  }
};
