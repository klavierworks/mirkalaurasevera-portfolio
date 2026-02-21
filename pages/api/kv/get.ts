import { kvGet } from "@/utils/kv";

export const runtime = 'edge';

export interface Env {
  VIDEO_CACHE: any;
}

export default async function handler(request: Request, env: Env) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key")!;

    const vimeoCache = await kvGet(key);

    if (vimeoCache === null) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    }

    console.log(typeof vimeoCache, vimeoCache.success);
    if (vimeoCache.success === false) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
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
