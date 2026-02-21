export const runtime = 'edge';

export interface Env {
  VIDEO_CACHE: any;
}

export default async function handler(request: Request, env: Env) {
  try {
    const { key, value } = await request.json() as {
      key: string;
      value: any;
    };

    await env.VIDEO_CACHE.put(key, JSON.stringify(value));

    return new Response();
  } catch (err) {
    console.error("Error setting KV value:", err);

    return new Response(JSON.stringify(err), {
      status: 500,
    });
  }
};
