export interface Env {
  VIDEO_CACHE: any;
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const url = new URL(request.url);
      const key = url.searchParams.get("key");

      if (!key) {
        return new Response(JSON.stringify({ error: "Missing ?key parameter" }), {
          status: 400,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }

      const vimeoCache = await env.VIDEO_CACHE.get(key);

      if (vimeoCache === null) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }

      return new Response(vimeoCache, {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    } catch (err) {
      console.error("Error retrieving KV value:", err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  },
};

export default handler;