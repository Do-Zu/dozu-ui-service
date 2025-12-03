import { Loader2 } from 'lucide-react';

interface Props {
    title?: string;
}

export default function LoadingNode({ title }: Props) {
    return (
        <div className="flex flex-row gap-2 items-center text-muted-foreground whitespace-nowrap">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{title || 'Loading'} ...</span>
        </div>
    );
}
