
interface Env {
  BUCKET: any;
}

// Helper: Base64URL Encode/Decode to handle slashes in URL paths safely
const toBase64Url = (str: string): string => {
  try {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    return str;
  }
};

const fromBase64Url = (str: string): string | null => {
  try {
    // Restore padding and standard chars
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return atob(base64);
  } catch (e) {
    return null;
  }
};

export const onRequestPut = async (context: any) => {
  const key = context.params.key; // Filename from URL
  const url = new URL(context.request.url);
  const projectId = url.searchParams.get('project');

  try {
    if (!context.env.BUCKET) return new Response("R2 Bucket not configured", {status: 500});
    
    // If project ID is provided, store in a folder structure "projectId/filename"
    const storageKey = projectId ? `${projectId}/${key}` : key;
    
    const body = context.request.body; // Stream
    await context.env.BUCKET.put(storageKey, body);
    
    // Use Base64URL encoding for the public key to avoid routing issues with slashes
    const encodedKey = toBase64Url(storageKey);
    const publicUrl = `/api/images/${encodedKey}`;
    
    return Response.json({ success: true, url: publicUrl });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const onRequestGet = async (context: any) => {
  const rawKey = context.params.key;
  
  // Try to decode from Base64URL first (New Format)
  let key = fromBase64Url(rawKey);
  
  // Fallback: If decoding failed or result looks invalid, treat as legacy URI encoded (Old Format)
  if (!key) {
      key = decodeURIComponent(rawKey);
  }

  try {
    if (!context.env.BUCKET) return new Response("R2 Bucket not configured", {status: 500});
    
    const object = await context.env.BUCKET.get(key);
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new Response(object.body, { headers });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const onRequestDelete = async (context: any) => {
  const rawKey = context.params.key;
  
  // Try decode
  let key = fromBase64Url(rawKey);
  if (!key) key = decodeURIComponent(rawKey);

  try {
    if (!context.env.BUCKET) return new Response("R2 Bucket not configured", {status: 500});
    
    await context.env.BUCKET.delete(key);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
