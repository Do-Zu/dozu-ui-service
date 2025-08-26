import React from 'react';
import CommentThread from './components/CommentThread';

/**
 * Page component that renders the CommentThread.
 *
 * Renders a wrapper <div> containing the CommentThread component. This component accepts no props.
 *
 * @returns The Home page JSX element.
 */
export default function Home() {
    return (
        <div>
            <CommentThread />
        </div>
    );
}
