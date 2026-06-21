// Fonction Netlify (format moderne) : relais CORS pour l'identification de photos via iNaturalist.
// Remplace l'ancien identify.js — gère correctement les corps binaires (photo).
//
// Fichier à nommer EXACTEMENT : netlify/functions/identify.mjs
// (l'extension .mjs est importante, elle indique à Netlify d'utiliser le nouveau format)
//
// L'URL ne change pas : https://TON-SITE.netlify.app/.netlify/functions/identify

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const auth = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');

    if (!auth) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const bodyBuffer = await request.arrayBuffer();

    const upstream = await fetch('https://api.inaturalist.org/v1/computervision/score_image', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': contentType,
      },
      body: bodyBuffer,
    });

    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error', detail: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
