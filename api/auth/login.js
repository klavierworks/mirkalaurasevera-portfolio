export default async function GET(request) {
  const redirect_uri = `${new URL(request.url).origin}/auth/callback`;
  console.log('Redirecting to GitHub for OAuth', redirect_uri);
  console.log(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo`)
  return Response.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo`, 302);
}