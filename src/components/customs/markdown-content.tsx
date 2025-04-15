'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert the markdown to HTML (basic implementation)
    let html = content;
    //   // Convert headings
    //   .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    //   .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
    //   .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>')
    //   // Convert links
    //   .replace(
    //     /\[([^\]]+)\]\(([^)]+)\)/gim,
    //     '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
    //   )
    //   // Convert bold text
    //   .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
    //   // Convert italic text
    //   .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
    //   // Convert horizontal rules
    //   .replace(/^---$/gim, '<hr class="my-4 border-t border-gray-300" />')
    //   // Convert paragraphs (double newlines)
    //   .replace(/\n\n/gim, '</p><p class="my-2">');

    // Wrap with paragraph tags if not already
    // if (!html.startsWith('<h1') && !html.startsWith('<h2') && !html.startsWith('<h3')) {
    //   html = `<p class="my-2">${html}</p>`;
    // }

    containerRef.current.innerHTML = html;
  }, [content]);

  return (
    <Card className={`p-4 overflow-auto ${className}`}>
      <div ref={containerRef} className="prose max-w-none dark:prose-invert" />
    </Card>
  );
}
