const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, If-Range, If-None-Match, If-Modified-Since',
  'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Length, Content-Range, ETag, Last-Modified',
};

function responseHeaders(object) {
  const headers = new Headers(corsHeaders);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Content-Type', object.httpMetadata?.contentType || 'video/mp4');
  headers.set('ETag', object.httpEtag);
  if (object.uploaded) headers.set('Last-Modified', object.uploaded.toUTCString());
  return headers;
}

function parseRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value || '');
  if (!match || (!match[1] && !match[2])) return { invalid: true };
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!suffixLength) return { invalid: true };
    const length = Math.min(suffixLength, size);
    return { offset: size - length, length };
  }
  const offset = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;
  if (offset >= size || end < offset) return { invalid: true };
  return { offset, length: Math.min(end, size - 1) - offset + 1 };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { ...corsHeaders, Allow: 'GET, HEAD, OPTIONS' } });
    }

    let key;
    try {
      key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    } catch {
      return new Response('Bad request', { status: 400, headers: corsHeaders });
    }
    if (!key || key.includes('..') || key.includes('\\')) return new Response('Not found', { status: 404, headers: corsHeaders });

    const metadata = await env.VIDEOS.head(key);
    if (!metadata) return new Response('Not found', { status: 404, headers: corsHeaders });

    const headers = responseHeaders(metadata);
    if (request.method === 'HEAD') {
      headers.set('Content-Length', String(metadata.size));
      return new Response(null, { status: 200, headers });
    }

    const requestedRange = request.headers.get('Range');
    const ifRange = request.headers.get('If-Range');
    const useRange = requestedRange && (!ifRange || ifRange === metadata.httpEtag || ifRange === metadata.uploaded?.toUTCString());
    if (useRange) {
      const range = parseRange(requestedRange, metadata.size);
      if (range.invalid) {
        headers.set('Content-Range', `bytes */${metadata.size}`);
        return new Response(null, { status: 416, headers });
      }
      // Fetch the exact requested interval from R2, streaming it directly to the viewer.
      const ranged = await env.VIDEOS.get(key, { range });
      if (!ranged) return new Response('Not found', { status: 404, headers: corsHeaders });
      headers.set('Content-Length', String(range.length));
      headers.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${metadata.size}`);
      return new Response(ranged.body, { status: 206, headers });
    }

    const object = await env.VIDEOS.get(key);
    if (!object) return new Response('Not found', { status: 404, headers: corsHeaders });
    headers.set('Content-Length', String(metadata.size));
    return new Response(object.body, { status: 200, headers });
  },
};
