export async function onRequestPost(context) {
  const scriptUrl = context.env.STUDY_SCRIPT_URL;
  if (!scriptUrl) {
    return new Response(
      JSON.stringify({ result: 'error', message: 'STUDY_SCRIPT_URL is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const body = await context.request.text();

  await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: body,
    redirect: 'follow',
  });

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
