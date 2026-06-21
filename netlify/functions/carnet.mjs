// Fonction Netlify : stockage partagé du carnet (lecture/écriture), via Netlify Blobs.
// Fichier à placer EXACTEMENT à : netlify/functions/carnet.mjs

import { getStore } from '@netlify/blobs';

export default async (request) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const store = getStore('carnet-nature');

  if (request.method === 'GET') {
    try {
      const data = await store.get('entries', { type: 'json' });
      return new Response(JSON.stringify(data || []), {
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Read error', detail: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (!Array.isArray(body)) {
        return new Response(JSON.stringify({ error: 'Expected a JSON array' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...cors },
        });
      }
      await store.setJSON('entries', body);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Write error', detail: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: cors });
};
