import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclude Next.js internal files and static assets
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Parse subdomain (e.g. sitelenpona from sitelenpona.gimite.net)
  const parts = hostname.split('.');
  let subdomain = '';
  
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  if (isLocalhost) {
    // For local testing: e.g. "sitelenpona.localhost:3000" -> parts = ["sitelenpona", "localhost:3000"]
    if (parts.length > 1 && parts[parts.length - 1].startsWith('localhost')) {
      subdomain = parts[0];
    }
  } else {
    // For production: e.g. "sitelenpona.gimite.net" -> parts = ["sitelenpona", "gimite", "net"]
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // Supported subdomains/virtual hosts
  const validDomains = [
    'daedric',
    'futuramaalien',
    'linearelamite',
    'liparxe',
    'oldhylian',
    'protosinaitic',
    'sitelenpona',
    'tengwar',
  ];

  if (subdomain && validDomains.includes(subdomain)) {
    // Normalize path to ensure it always maps to a specific file (defaulting to index.html)
    let normalizedPath = url.pathname;
    if (normalizedPath === '/') {
      normalizedPath = '/index.html';
    } else if (normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath + 'index.html';
    }

    // Rewrite path to `/sites/[subdomain]/[normalizedPath]`
    url.pathname = `/sites/${subdomain}${normalizedPath}`;
    console.log(`[Proxy] Host: "${hostname}", Subdomain: "${subdomain}", Rewriting to: "${url.pathname}"`);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
