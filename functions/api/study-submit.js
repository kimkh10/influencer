const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbymf9MuhljUlU26eM6-FypyLtmVN2MpUSe9YSUzyRgzJm9ngmz5hgXkFbujMhFvSAa8/exec';

export async function onRequestPost(context) {
  const body = await context.request.text();

  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: body,
    redirect: 'follow',
  });

  const text = await res.text();

  return new Response(JSON.stringify({ result: 'success' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
