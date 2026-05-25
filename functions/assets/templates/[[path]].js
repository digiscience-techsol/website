const headers = {
  'content-type': 'text/plain; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow, noarchive'
};

export function onRequest() {
  return new Response('Internal operations asset removed from public site.\n', {
    status: 410,
    headers
  });
}
