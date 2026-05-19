import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ site: string; path: string[] }> }
) {
  const { site, path: pathSegments } = await context.params;

  const relativeFilePath = pathSegments.join('/');
  const safeRelativePath = path.normalize(relativeFilePath).replace(/^(\.\.(\/|\\|$))+/, '');

  let baseDir = path.join(process.cwd(), 'domain_data/dist');
  if (!fs.existsSync(baseDir)) {
    baseDir = path.join(process.cwd(), '../domain_data/dist');
  }
  let targetFilePath = path.join(baseDir, site, safeRelativePath);

  console.log(`[SiteSubPathRoute] site: "${site}", path: "${relativeFilePath}", file: "${targetFilePath}"`);

  try {
    const stats = fs.statSync(targetFilePath);
    if (stats.isDirectory()) {
      targetFilePath = path.join(targetFilePath, 'index.html');
    }
  } catch (err) {
    return new NextResponse('File Not Found', { status: 404 });
  }

  if (!fs.existsSync(targetFilePath)) {
    return new NextResponse('File Not Found', { status: 404 });
  }

  const mimeTypes: { [key: string]: string } = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
  };

  const ext = path.extname(targetFilePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const fileBuffer = fs.readFileSync(targetFilePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error reading static file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
