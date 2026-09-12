/** Reject cross-origin browser requests and non-local/production use. */
export function validateFixtureReset(
  request: Request,
  environment: string | undefined,
): number | null {
  if (environment !== 'development') return 404;
  const url = new URL(request.url);
  // Next's dev adapter can normalize request.url to localhost. Host retains
  // the browser-facing authority; forwarded headers are deliberately ignored.
  const host = request.headers.get('host') ?? url.host;
  if (!/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(host)) return 403;
  if (request.headers.get('origin') !== `${url.protocol}//${host}`) return 403;
  if (
    request.headers.get('content-type')?.split(';')[0].trim() !==
    'application/json'
  )
    return 415;
  return null;
}
