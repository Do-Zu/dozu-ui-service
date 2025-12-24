import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

function parseReasons(reasons?: string | null): string[] {
    if (!reasons) return [];
    try {
        const v = JSON.parse(reasons);
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
}

type Props = {
    message: string;
    createdAt: string;
    userEmail?: string | null;
    userName?: string | null;
    userId?: number | null;
    imageUrl?: string | null;
    reasons?: string | null;
};

export function FeedbackContentCell({
    message,
    createdAt,
    userEmail,
    userName,
    userId,
    imageUrl,
    reasons,
}: Props) {
    const parsedReasons = parseReasons(reasons);

    return (
        <div className="space-y-1">
            <div className="line-clamp-2">{message}</div>

            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>by {userEmail || userName || (userId ? `User #${userId}` : 'Anonymous')}</span>
                <span>•</span>
                <span>{new Date(createdAt).toLocaleString()}</span>
                {imageUrl && (
                    <a className="inline-flex items-center gap-1 underline" href={imageUrl} target="_blank" rel="noreferrer">
                        View image <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </div>

            {parsedReasons.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                    {parsedReasons.slice(0, 4).map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">
                            {r}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
