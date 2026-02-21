const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_NAMESPACE_ID = "VIDEO_CACHE";
const CF_API_TOKEN = process.env.CF_API_TOKEN;

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/values`;

const headers = {
  Authorization: `Bearer ${CF_API_TOKEN}`,
};

export const kvGet = async (key: string) => {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(key)}`, {
    headers,
  });
  if (res.status === 404) return null;
  return res.json();
}

export const kvSet = async (key: string, value: string) => {
  await fetch(`${BASE_URL}/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers,
    body: value,
  });
}