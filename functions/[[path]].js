const blockedHeaders = {
  'content-type': 'text/plain; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow, noarchive'
};

export function onRequest() {
  return new Response('Not found.\n', {
    status: 404,
    headers: blockedHeaders
  });
}
