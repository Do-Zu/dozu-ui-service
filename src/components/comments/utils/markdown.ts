/**
 * Markdown renderer utility for content
 * Supports: headings, bold, italic, underline, lists, horizontal rules, code blocks, tables
 */
export const renderMarkdown = (text: string): string => {
    if (!text) return '';
    
    const lines = text.split('\n');
    const processedLines: string[] = [];
    let inList: 'ul' | 'ol' | false = false;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];
    
    const closeList = () => {
        if (inList) {
            processedLines.push(inList === 'ul' ? '</ul>' : '</ol>');
            inList = false;
        }
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Handle code blocks (```)
        if (trimmedLine.startsWith('```')) {
            if (inCodeBlock) {
                // End code block
                processedLines.push(`<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
                codeBlockContent = [];
                inCodeBlock = false;
            } else {
                // Start code block
                closeList();
                if (inTable) {
                    processedLines.push(renderTable(tableRows));
                    tableRows = [];
                    inTable = false;
                }
                inCodeBlock = true;
            }
            continue;
        }
        
        if (inCodeBlock) {
            codeBlockContent.push(line);
            continue;
        }
        
        // Handle horizontal rules (---)
        if (trimmedLine.match(/^---+$/)) {
            closeList();
            if (inTable) {
                processedLines.push(renderTable(tableRows));
                tableRows = [];
                inTable = false;
            }
            processedLines.push('<hr class="my-4 border-t border-border" />');
            continue;
        }
        
        // Handle tables (|)
        if (trimmedLine.includes('|') && trimmedLine.split('|').length >= 3) {
            closeList();
            if (!inTable) {
                inTable = true;
            }
            // Skip separator rows (|---|---|)
            if (!trimmedLine.match(/^\|[\s\-:]+$/)) {
                tableRows.push(line);
            }
            continue;
        } else if (inTable) {
            processedLines.push(renderTable(tableRows));
            tableRows = [];
            inTable = false;
        }
        
        // Handle headings (#, ##, ###)
        // Use [^\n]* instead of [^\n]+ to avoid backtracking issues
        const headingMatch = trimmedLine.match(/^(#{1,6})\s+([^\n]*)$/);
        if (headingMatch) {
            closeList();
            const level = headingMatch[1].length;
            const content = headingMatch[2];
            const headingClass = level === 1 ? 'text-2xl font-bold mt-6 mb-3' :
                                level === 2 ? 'text-xl font-semibold mt-5 mb-2' :
                                level === 3 ? 'text-lg font-semibold mt-4 mb-2' :
                                'text-base font-semibold mt-3 mb-1';
            processedLines.push(`<h${level} class="${headingClass}">${processInlineMarkdown(content)}</h${level}>`);
            continue;
        }
        
        // Handle list items (- or *)
        // Use [^\n]* instead of [^\n]+ to avoid backtracking issues
        const listMatch = trimmedLine.match(/^[-*]\s+([^\n]*)$/);
        if (listMatch) {
            if (inList !== 'ul') {
                closeList();
                processedLines.push('<ul class="list-disc ml-6 space-y-1 my-2">');
                inList = 'ul';
            }
            processedLines.push(`<li class="ml-2">${processInlineMarkdown(listMatch[1])}</li>`);
            continue;
        }
        
        // Handle numbered lists (1. 2. etc)
        // Use [^\n]* instead of [^\n]+ to avoid backtracking issues
        const numberedListMatch = trimmedLine.match(/^\d+\.\s+([^\n]*)$/);
        if (numberedListMatch) {
            if (inList !== 'ol') {
                closeList();
                processedLines.push('<ol class="list-decimal ml-6 space-y-1 my-2">');
                inList = 'ol';
            }
            processedLines.push(`<li class="ml-2">${processInlineMarkdown(numberedListMatch[1])}</li>`);
            continue;
        }
        
        // Close list if needed (when encountering non-list content)
        if (inList && trimmedLine) {
            closeList();
        }
        
        // Handle empty lines (paragraph breaks)
        if (!trimmedLine) {
            if (i < lines.length - 1) {
                processedLines.push('<br />');
            }
            continue;
        }
        
        // Regular paragraph
        processedLines.push(`<p class="my-2">${processInlineMarkdown(trimmedLine)}</p>`);
    }
    
    // Close any open blocks
    closeList();
    if (inTable) {
        processedLines.push(renderTable(tableRows));
    }
    if (inCodeBlock) {
        processedLines.push(`<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
    }
    
    return processedLines.join('');
};

/**
 * Process inline markdown (bold, italic, underline)
 */
function processInlineMarkdown(text: string): string {
    // Escape HTML first
    let html = escapeHtml(text);
    
    // Process bold: **text** (double asterisk) - do this first
    // Use * instead of + to avoid backtracking
    html = html.replace(/\*\*([^*]*)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    // Process underline: __text__ (double underscore)
    // Use * instead of + to avoid backtracking
    html = html.replace(/__([^_]*)__/g, '<u class="underline">$1</u>');
    
    // Process italic: *text* (single asterisk, not part of double asterisk)
    // Use [^\n]* instead of [^\n]+ to avoid backtracking
    html = html.replace(/\*([^*\n]*)\*/g, (match, content, offset, string) => {
        // Check surrounding characters to ensure this is not part of bold
        const before = offset > 0 ? string[offset - 1] : '';
        const after = offset + match.length < string.length ? string[offset + match.length] : '';
        
        // Skip if surrounded by asterisks (part of bold, though should be handled already)
        if (before === '*' || after === '*') {
            return match;
        }
        
        return '<em class="italic">' + content + '</em>';
    });
    
    // Process inline code: `code`
    // Use * instead of + to avoid backtracking
    html = html.replace(/`([^`]*)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
    
    return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Render markdown table
 */
function renderTable(rows: string[]): string {
    if (rows.length === 0) return '';
    
    const processedRows: string[] = [];
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length === 0) continue;
        
        const isHeader = i === 0;
        const cellElements = cells.map(cell => {
            const processedCell = processInlineMarkdown(cell);
            return isHeader
                ? `<th class="px-4 py-2 border-b border-border font-semibold text-left bg-muted/50">${processedCell}</th>`
                : `<td class="px-4 py-2 border-b border-border">${processedCell}</td>`;
        });
        
        processedRows.push(`<tr>${cellElements.join('')}</tr>`);
    }
    
    return `<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-border">${processedRows.join('')}</table></div>`;
}
