import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    // Get URL from query string
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
      return new NextResponse('URL parameter is required', { status: 400 });
    }

    // Make request to the target website
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    // Get HTML content
    let html = response.data;

    // Sanitize the HTML to prevent XSS and make internal resources work
    html = sanitizeAndFixHtml(html, url);

    // Create the proxy HTML
    const proxyHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Proxy: ${url}</title>
          <base href="${url}">
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            .proxy-banner { position: fixed; top: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; 
              padding: 8px; text-align: center; z-index: 9999; font-size: 14px; }
            .proxy-banner a { color: #4da3ff; text-decoration: none; }
            .proxy-banner a:hover { text-decoration: underline; }
            .proxy-content { margin-top: 38px; }
          </style>
        </head>
        <body>
          <div class="proxy-banner">
            Proxied view of <a href="${url}" target="_blank">${new URL(url).hostname}</a> (Some functionality may be limited)
          </div>
          <div class="proxy-content">
            ${html}
          </div>
        </body>
      </html>
    `;

    return new NextResponse(proxyHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('Error in website proxy:', error.message);
    return new NextResponse(`Error loading website: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}

/**
 * Sanitize HTML and fix relative paths
 */
function sanitizeAndFixHtml(html: string, baseUrl: string): string {
  // Convert relative URLs to absolute
  const baseUrlObj = new URL(baseUrl);
  const baseOrigin = baseUrlObj.origin;
  const basePath = baseUrlObj.pathname.substring(0, baseUrlObj.pathname.lastIndexOf('/') + 1);

  // Fix relative URLs in src and href attributes
  html = html.replace(
    /\s(src|href)=['"]((?!http|\/\/|data:|mailto:|tel:)[^'"]+)['"]/gi,
    (match, attr, url) => {
      let absoluteUrl = url;
      if (url.startsWith('/')) {
        // Absolute path
        absoluteUrl = `${baseOrigin}${url}`;
      } else {
        // Relative path
        absoluteUrl = `${baseOrigin}${basePath}${url}`;
      }
      return ` ${attr}="${absoluteUrl}"`;
    },
  );

  // Add target="_blank" to all links to open in new tab
  html = html.replace(/<a\s+(?![^>]*\starget=)/gi, '<a target="_blank" ');

  return html;
}
