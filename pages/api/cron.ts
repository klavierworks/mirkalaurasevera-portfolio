import { NextRequest, NextResponse } from 'next/server';


export const handler = async (req: NextRequest, res: NextResponse) => {
  // @ts-expect-error ignore
  if (req.headers['Authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    // @ts-expect-error ignore
    return res.status(401).end('Unauthorized');
  }

  await fetch('https://api.vercel.com/v1/integrations/deploy/prj_IIUWYKS3Bjm00vaIgvytKgscaUKS/RYOOi2sE3g', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  // @ts-expect-error ignore
  res.status(200).end('Hello Cron!');
}

export default handler;