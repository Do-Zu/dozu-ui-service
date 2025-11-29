import Suggestion, { SuggestionProps } from '@tiptap/suggestion';
import { CommandOptionProps } from '../../hooks/tiptap/useCommandOptions';
import { Extension, ReactRenderer } from '@tiptap/react';
import { ComponentProps } from 'react';
import CommandsView, { CommandsViewRef } from '../../components/note/CommandsView';
import { computePosition, flip, offset, shift } from '@floating-ui/react';

// Create a Commands Extension
const createCommandsPlugin = (options: CommandOptionProps[]) =>
    Extension.create({
        name: 'insertMenu', // name of Extension
        addProseMirrorPlugins() {
            return [
                Suggestion<CommandOptionProps>({
                    editor: this.editor, // get editor of context
                    char: '/', // character to trigger this plugin
                    // A function that is called when a suggestion is selected.
                    // the props argument contains title, icon, attributes, & function command of the item
                    // inside this function, the function command (defined inside array of items) will be executed
                    command: ({ editor, range, props }) => {
                        props.command({ editor, range, props });
                    },
                    // list of items that user can use
                    // query (string): characters that user types with trigger (eg. '/heading')
                    // return an array that match the query
                    items: ({ query }) => {
                        return (
                            options
                                // only return items that match with the start of the query
                                .filter((item) => {
                                    return item.title.toLowerCase().replace(' ', '').startsWith(query.toLowerCase());
                                })
                                // limit to 20 items
                                .slice(0, 20)
                        );
                    },
                    startOfLine: true, // allow only when '/' is typed at the start of the line
                    // component to be rendered on top of the trigger
                    render() {
                        let component: ReactRenderer<ComponentProps<typeof CommandsView>, any>,
                            popup: HTMLDivElement | null = null;
                        return {
                            // triggered when user clicks '/'
                            // this function will initialize component
                            // (create CommandsView component, mount it to popup & parent node of editor instance)
                            // props is an object including editor instance, range, query, text, clientRect (function returns DOMRect) of the suggestion
                            onStart(props) {
                                popup = document.createElement('div');
                                // get parentNode of editor
                                const editorParent = props.editor.view.dom.parentNode as HTMLElement;

                                if (editorParent) {
                                    editorParent.style.position = 'relative';
                                    editorParent.appendChild(popup); // bind popup to editorParent
                                }

                                // use ReactRenderer for tiptap to render React components inside tiptap components
                                component = new ReactRenderer(CommandsView, {
                                    props,
                                    editor: props.editor,
                                }) as ReactRenderer<SuggestionProps<any, any>>;

                                popup.appendChild(component.element);
                                updatePosition(props);
                            },
                            // triggered when user clicks characters after '/' (eg. '/heading')
                            // this function will update props of component, making CommandsView re-render, updating pop-up position
                            onUpdate(props) {
                                component.updateProps(props);
                                updatePosition(props);
                            },
                            // triggered when user clicks shortcuts (eg. Enter, ArrowUp, ArrowDown, etc)
                            onKeyDown({ event }) {
                                if (event.key === 'Escape') {
                                    popup?.remove();
                                    return true;
                                }
                                // call onKeyDown of CommandsView
                                return (component?.ref as CommandsViewRef)?.onKeyDown?.(event) || false;
                            },
                            // triggered when user deletes '/'
                            // this function will remove popup from DOM, unmount CommandsView
                            onExit() {
                                if (popup) {
                                    popup.remove();
                                    popup = null;
                                }
                                component?.destroy();
                            },
                        };

                        async function updatePosition(props: SuggestionProps<any, any>) {
                            if (!popup || !props.clientRect) return;

                            // virtual referenced element, floating UI computes position based on this virual element's position
                            const getBoundingClientRect = (
                                props.clientRect() ? props.clientRect : () => new DOMRect(0, 0, 0, 0)
                            ) as () => DOMRect;

                            // compute position of floating popup, returning x & y
                            const { x, y } = await computePosition(
                                {
                                    getBoundingClientRect,
                                },
                                popup,
                                {
                                    placement: 'bottom-start',
                                    middleware: [offset(6), flip(), shift()],
                                },
                            );
                            // assign computed position to floating popup
                            if (popup && popup.isConnected) {
                                Object.assign(popup.style, {
                                    position: 'absolute',
                                    left: `${x}px`,
                                    top: `${y}px`,
                                });
                            }
                        }
                    },
                }),
            ];
        },
    });

export default createCommandsPlugin;
