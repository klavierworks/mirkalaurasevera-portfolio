type Context = {
  request: Request;
  env: {
    VIDEO_CACHE: any;
  };
}

export async function onRequest(context: Context) {
    try {
      const KV = context.env.VIDEO_CACHE;
      const key = context.request.url.split('?key=')[1];

      const vimeoCache = await KV.get(key);
      return new Response(vimeoCache || '{}');
  } catch (err) {
      let json = JSON.stringify(err)
      console.error('Error retrieving KV value:', err);
      return new Response(json, { status: 500 });
  }
}