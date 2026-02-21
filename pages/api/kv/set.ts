export interface Env {
  VIDEO_CACHE: any;
}

const handler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const { key, value } = (await request.json().catch(() => ({}))) as {
        key?: string;
        value?: unknown;
      };

      if (!key) {
        return new Response(JSON.stringify({ error: "Missing key" }), {
          status: 400,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }

      await env.VIDEO_CACHE.put(key, JSON.stringify(value));

      return new Response(JSON.stringify({ success: true }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    } catch (err) {
      console.error("Error setting KV value:", err);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  },
};

export default handler;