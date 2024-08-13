export default async function handler(req, res) {
  // if (req.headers['Authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).end('Unauthorized');
  // }

  await fetch('https://api.vercel.com/v1/integrations/deploy/prj_IIUWYKS3Bjm00vaIgvytKgscaUKS/RYOOi2sE3g', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  res.status(200).end('Hello Cron!');
}