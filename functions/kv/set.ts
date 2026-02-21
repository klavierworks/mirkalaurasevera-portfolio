type Context = {
  request: Request;
  env: {
    VIDEO_CACHE: any;
  };
}

export async function onRequest(context: Context) {
    try {
      const KV = context.env.VIDEO_CACHE;
      const { key, value } = await context.request.json();
      KV.put(key, JSON.stringify(value));
      return new Response(value || '{}');
  } catch (err) {
      let json = JSON.stringify(err)
      console.error('Error setting KV value:', err);
      return new Response(json, { status: 500 });
  }
}