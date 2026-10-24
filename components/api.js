// Tiny helpers for calling the site's own API from the dashboard
export const call = (method, url, body) => fetch(url, {
  method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
});
export const post = (url, body) => call('POST', url, body);
