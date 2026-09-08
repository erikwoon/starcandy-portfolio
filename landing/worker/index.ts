// Serves /photos/* from R2 instead of the static-assets bundle.
// wrangler.jsonc routes only /photos/* here (run_worker_first) — every
// other request is served directly by the assets layer, so this Worker
// never sees them.

export interface Env {
  PHOTOS_BUCKET: R2Bucket;
}

const CONTENT_TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Strip the leading "/" so "/photos/thumb/x.webp" becomes the R2 key
    // "photos/thumb/x.webp" (objects were uploaded under that prefix).
    const key = url.pathname.slice(1);

    const object = await env.PHOTOS_BUCKET.get(key);
    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const ext = key.split('.').pop()?.toLowerCase() ?? '';
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Type', CONTENT_TYPES[ext] ?? 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag);

    return new Response(object.body, { headers });
  },
};
