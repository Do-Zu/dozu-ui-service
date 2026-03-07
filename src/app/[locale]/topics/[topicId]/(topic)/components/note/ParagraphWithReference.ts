import { Paragraph } from '@tiptap/extension-paragraph';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ReferenceNodeView from './ReferenceNodeView';

/**
 * Custom Paragraph extension that preserves data-reference attribute
 * and renders a React NodeView with tooltip for referenced paragraphs.
 */
export const ParagraphWithReference = Paragraph.extend({
    addAttributes() {
        return {
            dataReference: {
                default: null,
                parseHTML: (element: HTMLElement) => element.getAttribute('data-reference'),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                renderHTML: (attributes: Record<string, unknown>) => {
                    if (!attributes.dataReference) {
                        return {};
                    }
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    return { 'data-reference': attributes.dataReference };
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ReferenceNodeView);
    },
});
