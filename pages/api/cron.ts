import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export const handler = async (req: Request) => {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {status: 401})
  }

  await fetch('https://api.vercel.com/v1/integrations/deploy/prj_IIUWYKS3Bjm00vaIgvytKgscaUKS/RYOOi2sE3g', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  return new Response('Hello Cron!', { status: 200 });
}

export default handler;