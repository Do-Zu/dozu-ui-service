import { useEffect } from 'react';
import { useTopicWorkspace } from '../context/TopicWorkspaceContext';
import noteReferenceUtils from '../utils/note-reference.utils';

/**
 * Hook that enhances note content with reference tooltips and click navigation
 */
export function useNoteReferences() {
    const { seekTo } = useTopicWorkspace();

    const REFERENCE_STYLE_ID = 'note-reference-styles';

    useEffect(() => {
        // Add styles for reference segments — deduplicated to avoid double injection in React StrictMode
        let addedStyle = false;
        if (!document.getElementById(REFERENCE_STYLE_ID)) {
            const style = document.createElement('style');
            style.id = REFERENCE_STYLE_ID;
            style.textContent = `
            [data-reference] {
                position: relative;
                transition: background-color 0.2s ease;
            }
            
            [data-reference]:hover {
                background-color: rgba(234, 179, 8, 0.3);
                border-radius: 4px;
            }
            
            [data-reference]::after {
                content: '📌';
                margin-left: 4px;
                font-size: 0.75em;
                opacity: 0;
                transition: opacity 0.2s ease;
                cursor: pointer;
            }
            
            [data-reference]:hover::after {
                opacity: 1;
            }
        `;
            document.head.appendChild(style);
            addedStyle = true;
        }

        // Add click handlers to reference segments
        const addReferenceClickHandlers = () => {
            const refElements = document.querySelectorAll('[data-reference]');
            refElements.forEach((element) => {
                const encodedRef = element.getAttribute('data-reference');
                const reference = noteReferenceUtils.decodeReference(encodedRef || '');

                if (reference && !element.hasAttribute('data-reference-listener-added')) {
                    element.setAttribute('data-reference-listener-added', 'true');
                    (element as HTMLElement).style.cursor = 'pointer';

                    // Add click handler
                    element.addEventListener('click', (e: Event) => {
                        e.stopPropagation();
                        if (
                            (reference.type === 'youtube' || reference.type === 'media') &&
                            reference.timestamp != null
                        ) {
                            seekTo(reference.timestamp);
                        }
                    });

                    // Add keyboard support
                    element.addEventListener('keydown', (e: Event) => {
                        const keyboardEvent = e as KeyboardEvent;
                        if (
                            keyboardEvent.key === 'Enter' &&
                            (reference.type === 'youtube' || reference.type === 'media') &&
                            reference.timestamp != null
                        ) {
                            seekTo(reference.timestamp);
                        }
                    });

                    // Add title attribute for basic tooltip
                    const refText = noteReferenceUtils.formatReference(reference);
                    element.setAttribute('title', refText || 'Click to navigate to source');
                }
            });
        };

        // Initial setup
        addReferenceClickHandlers();

        // Watch for DOM changes (when content is updated)
        const observer = new MutationObserver(() => {
            addReferenceClickHandlers();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-reference'],
        });

        return () => {
            if (addedStyle) {
                document.getElementById(REFERENCE_STYLE_ID)?.remove();
            }
            observer.disconnect();
        };
    }, [seekTo]);
}
