export default async function GET(request) {
  const redirect_uri = `${process.env.VERCEL_URL}/auth/callback`;

  return Response.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo`, 302);
}