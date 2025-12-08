/**
 * Beautiful curved connector lines for nested comments (Facebook style)
 * - Bezier curves instead of sharp corners
 * - Thinner and more transparent as depth increases
 * - Supports infinite nesting levels
 */
interface ConnectorLinesProps {
    level: number;
}

export default function ConnectorLines({ level }: ConnectorLinesProps) {
    if (level === 0) return null;

    const strokeWidth = Math.max(1.2, 2 - level * 0.25);
    const verticalOpacity = Math.max(0.25, 0.5 - level * 0.08);
    const horizontalOpacity = Math.max(0.3, 0.6 - level * 0.1);

    return (
        <svg
            className="absolute left-0 top-0 w-20 h-full pointer-events-none overflow-visible"
            style={{ zIndex: 0 }}
        >
            {/* Vertical line - fades as depth increases */}
            <line
                x1="30"
                y1="0"
                x2="30"
                y2="100%"
                stroke="rgb(156 163 175)"
                strokeWidth={strokeWidth}
                opacity={verticalOpacity}
                className="dark:stroke-gray-600"
                style={{ strokeOpacity: verticalOpacity }}
            />
            
            {/* Curved horizontal line (bezier curve) connecting to avatar */}
            <path
                d="M 30 40 Q 42 40, 48 40"
                stroke="rgb(156 163 175)"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={horizontalOpacity}
                className="dark:stroke-gray-600"
                style={{ strokeOpacity: horizontalOpacity }}
            />
        </svg>
    );
}
