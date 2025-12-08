'use client';

import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Send, Bold, Italic, Underline, List, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';

interface CommentInputProps {
    onSubmit: (content: string) => Promise<void>;
    loading?: boolean;
    placeholder?: string;
}

export default function CommentInput({ onSubmit, loading = false, placeholder = 'Thêm nhận xét trong lớp học...' }: CommentInputProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const getInitials = (name: string | null, username: string) => {
        if (name && name.trim()) {
            return name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
        }
        if (username && username.trim()) {
            return username.substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    const handleSubmit = async () => {
        if (!content.trim() || loading) return;
        
        try {
            await onSubmit(content.trim());
            setContent('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const applyFormatting = (command: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        let formattedText = '';
        let newCursorPos = start;

        switch (command) {
            case 'bold':
                if (selectedText) {
                    // If text is selected, wrap it
                    formattedText = `**${selectedText}**`;
                    newCursorPos = start + formattedText.length;
                } else {
                    // If no text selected, insert markers at cursor
                    formattedText = '****';
                    newCursorPos = start + 2; // Position cursor between markers
                }
                break;
            case 'italic':
                if (selectedText) {
                    formattedText = `*${selectedText}*`;
                    newCursorPos = start + formattedText.length;
                } else {
                    formattedText = '**';
                    newCursorPos = start + 1;
                }
                break;
            case 'underline':
                if (selectedText) {
                    formattedText = `__${selectedText}__`;
                    newCursorPos = start + formattedText.length;
                } else {
                    formattedText = '____';
                    newCursorPos = start + 2;
                }
                break;
            case 'list':
                if (selectedText) {
                    // Split by lines and add bullet to each line
                    const lines = selectedText.split('\n');
                    formattedText = lines
                        .map(line => {
                            const trimmed = line.trim();
                            if (!trimmed) return '';
                            // Remove existing bullet if present
                            const withoutBullet = trimmed.startsWith('- ') ? trimmed.substring(2) : trimmed;
                            return `- ${withoutBullet}`;
                        })
                        .join('\n');
                    newCursorPos = start + formattedText.length;
                } else {
                    // Insert bullet at current line
                    const beforeCursor = content.substring(0, start);
                    const afterCursor = content.substring(end);
                    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
                    const lineEnd = afterCursor.indexOf('\n');
                    const currentLine = content.substring(lineStart, lineEnd === -1 ? content.length : start + lineEnd);
                    
                    if (currentLine.trim().startsWith('- ')) {
                        // Already a list item, remove bullet
                        formattedText = currentLine.replace(/^- /, '');
                        const newContent = content.substring(0, lineStart) + formattedText + content.substring(lineStart + currentLine.length);
                        setContent(newContent);
                        setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start - 2, start - 2);
                        }, 0);
                        return;
                    } else {
                        formattedText = `- `;
                        newCursorPos = start + formattedText.length;
                    }
                }
                break;
            case 'clear':
                if (selectedText) {
                    // Remove markdown formatting
                    formattedText = selectedText
                        .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
                        .replace(/\*([^*]+)\*/g, '$1') // Italic
                        .replace(/__([^_]+)__/g, '$1') // Underline
                        .replace(/^- /gm, '') // List bullets
                        .trim();
                    newCursorPos = start + formattedText.length;
                } else {
                    // Clear formatting from entire content
                    const cleared = content
                        .replace(/\*\*([^*]+)\*\*/g, '$1')
                        .replace(/\*([^*]+)\*/g, '$1')
                        .replace(/__([^_]+)__/g, '$1')
                        .replace(/^- /gm, '');
                    setContent(cleared);
                    setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start, start);
                    }, 0);
                    return;
                }
                break;
            default:
                formattedText = selectedText;
                newCursorPos = start + formattedText.length;
        }

        const newContent = content.substring(0, start) + formattedText + content.substring(end);
        setContent(newContent);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || 'User'} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs">
                    {getInitials(user?.fullName || null, user?.username || '')}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="w-full min-h-[60px] max-h-[200px] px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        rows={2}
                        disabled={loading}
                    />
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => applyFormatting('bold')}
                            title="Bold"
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => applyFormatting('italic')}
                            title="Italic"
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => applyFormatting('underline')}
                            title="Underline"
                        >
                            <Underline className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => applyFormatting('list')}
                            title="List"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => applyFormatting('clear')}
                            title="Clear formatting"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={handleSubmit}
                        disabled={!content.trim() || loading}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

