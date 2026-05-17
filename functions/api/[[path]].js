const TARGET = 'https://api.store.friendly-pharmacist.com';

// Origin 허용 규칙 (clone 받은 누구든 자신의 Pages 프로젝트에서 동작하도록 일반화):
// - 모든 *.pages.dev 서브도메인 (Cloudflare Pages 프로덕션/프리뷰)
// - 로컬 개발: http://localhost:<port> / http://127.0.0.1:<port>
function isAllowedOrigin(origin) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    if (u.protocol === 'https:' && (u.hostname === 'pages.dev' || u.hostname.endsWith('.pages.dev'))) return true;
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) return true;
  } catch (_) {
    return false;
  }
  return false;
}

function getCorsOrigin(request) {
  const origin = request.headers.get('origin') || '';
  if (isAllowedOrigin(origin)) return origin;
  // 기본값: 요청 Origin 헤더가 없거나 허용되지 않으면 와일드카드 대신 빈 값 반환을 피하기 위해 localhost를 폴백으로 사용
  return 'http://localhost:8788';
}

export async function onRequest(context) {
  const corsOrigin = getCorsOrigin(context.request);

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(context.request.url);
  const targetUrl = `${TARGET}${url.pathname}${url.search}`;

  const headers = new Headers(context.request.headers);
  headers.delete('host');
  headers.delete('origin');
  headers.delete('referer');

  const init = { method: context.request.method, headers };
  if (!['GET', 'HEAD'].includes(context.request.method)) {
    init.body = context.request.body;
  }

  const res = await fetch(targetUrl, init);

  const responseHeaders = new Headers(res.headers);
  responseHeaders.set('Access-Control-Allow-Origin', corsOrigin);

  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}
