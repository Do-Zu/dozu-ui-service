import { Badge } from '@/components/ui/badge';

type Props = {
    score: number;
    hasImage?: boolean;
};

export function ScoreCell({ score, hasImage }: Props) {
    return (
        <div className="flex items-center gap-3">
            <div
                title={`Score: ${score}`}
                className={`inline-flex items-center gap-1 font-semibold tabular-nums
                    ${score >= 4 ? 'text-amber-600' : score >= 2 ? 'text-sky-600' : 'text-muted-foreground'}
                `}
            >
                <span aria-hidden>⭐</span>
                <span className="text-base leading-none">{score}</span>
            </div>

            {hasImage && (
                <Badge variant="secondary" className="text-sm">
                    📷
                </Badge>
            )}
        </div>
    );
}
