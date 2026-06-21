// Fonction Netlify : relais CORS pour l'identification de photos via iNaturalist.
// À déployer dans un projet Netlify, au chemin : netlify/functions/identify.js
//
// Une fois déployée, son URL ressemble à :
//   https://TON-SITE.netlify.app/.netlify/functions/identify
// Colle cette URL dans l'appli Carnet Nature, onglet Réglages > Relais photo.
 
exports.handler = async (event) => {
  // Pré-vérification CORS envoyée automatiquement par le navigateur
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
      body: '',
    };
  }
 
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
 
  try {
    const auth = event.headers['authorization'] || event.headers['Authorization'];
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
 
    if (!auth) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization header' }) };
    }
 
    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body, 'utf8');
 
    const upstream = await fetch('https://api.inaturalist.org/v1/computervision/score_image', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': contentType,
      },
      body: bodyBuffer,
    });
 
    const text = await upstream.text();
 
    return {
      statusCode: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Proxy error', detail: String(err) }),
    };
  }
};
