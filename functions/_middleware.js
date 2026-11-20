const BLOCK_PREFIXES = ['/.claude', '/.cursor', '/lead-dashboard'];

export async function onRequest(context) {
  const path = new URL(context.request.url).pathname;
  if (BLOCK_PREFIXES.some((p) => path === p || path.startsWith(p + '/') || path.startsWith(p))) {
    return new Response('Not found.\n', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-robots-tag': 'noindex, nofollow, noarchive',
      },
    });
  }
  return context.next();
}
