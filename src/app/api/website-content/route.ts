import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import sanitizeHtml from 'sanitize-html';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Make request to the target website
    const response = await axios.get(url, {
      headers: {
        // Some websites block requests without a user agent
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    // Get HTML content
    const html = response.data;

    // Extract text content from HTML
    const textContent = extractTextFromHtml(html);

    // Format as markdown
    const markdownContent = formatAsMarkdown(textContent, url);

    return NextResponse.json({
      content: markdownContent,
      html: html, // Adding the raw HTML content
      url: url,
    });
  } catch (error: any) {
    console.error('Error fetching website content:', error.message);
    return NextResponse.json({ error: 'Failed to fetch website content' }, { status: 500 });
  }
}

/**
 * Extract readable text content from HTML
 */
function extractTextFromHtml(html: string): string {
  // Use sanitize-html to remove unwanted tags and extract text content
  const sanitizedHtml = sanitizeHtml(html, {
    allowedTags: [], // Remove all tags
    allowedAttributes: {}, // Remove all attributes
  });

  // Remove excessive whitespace
  const text = sanitizedHtml.replace(/\s+/g, ' ').trim();

  // Split by line breaks and filter empty lines
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.join('\n\n');
}

/**
 * Format the extracted text as markdown
 */
function formatAsMarkdown(text: string, sourceUrl: string): string {
  // Add title and source
  let markdown = `# Content from ${new URL(sourceUrl).hostname}\n\n`;

  // Add source URL
  markdown += `*Source: [${sourceUrl}](${sourceUrl})*\n\n`;

  // Add horizontal rule
  markdown += `---\n\n`;

  // Add the content
  markdown += text;

  return markdown;
}
