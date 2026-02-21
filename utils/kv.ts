const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_NAMESPACE_ID = "VIDEO_CACHE";
const CF_API_TOKEN = process.env.CF_API_TOKEN;

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/values`;

const headers = {
  Authorization: `Bearer ${CF_API_TOKEN}`,
};

export async function kvGet(key: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(key)}`, {
    headers,
  });
  if (res.status === 404) return null;
  return res.text();
}

export async function kvSet(key: string, value: string): Promise<void> {
  await fetch(`${BASE_URL}/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers,
    body: value,
  });
}