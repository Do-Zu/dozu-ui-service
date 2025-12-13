/**
 * Markdown renderer utility for comment content
 * Supports: bold, italic, underline, lists
 */
export const renderMarkdown = (text: string): string => {
    if (!text) return '';
    
    // Escape HTML first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Process bold: **text** (double asterisk) - do this first
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
    
    // Process underline: __text__ (double underscore)
    html = html.replace(/__([^_]+)__/g, '<u class="underline">$1</u>');
    
    // Process italic: *text* (single asterisk, not part of double asterisk)
    // Only match single asterisks that are not adjacent to another asterisk
    html = html.replace(/([^*]|^)\*([^*\n]+)\*([^*]|$)/g, '$1<em class="italic">$2</em>$3');
    
    // Process list items
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const listMatch = line.match(/^- (.+)$/);
        
        if (listMatch) {
            if (!inList) {
                processedLines.push('<ul class="list-disc ml-4 space-y-1">');
                inList = true;
            }
            processedLines.push(`<li>${listMatch[1]}</li>`);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            if (line.trim()) {
                processedLines.push(line);
            } else if (i < lines.length - 1) {
                // Only add <br /> if not the last line
                processedLines.push('<br />');
            }
        }
    }
    
    if (inList) {
        processedLines.push('</ul>');
    }
    
    html = processedLines.join('');
    
    return html;
};
