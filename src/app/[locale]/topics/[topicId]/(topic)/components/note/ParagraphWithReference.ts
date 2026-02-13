import { Paragraph } from '@tiptap/extension-paragraph';

/**
 * Custom Paragraph extension that preserves data-reference attribute
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
});
