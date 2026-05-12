export const corsHeaders = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
});

export function withCorsInit(init: ResponseInit = {}) {
  const headers = new Headers(init.headers ?? {});
  for (const [key, value] of corsHeaders.entries()) {
    headers.set(key, value);
  }
  return {
    ...init,
    headers
  };
}
