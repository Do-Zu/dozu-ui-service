import { Button } from '@/components/ui/button';
import { Maximize, Minimize, X } from 'lucide-react';

interface Props {
    onClose?: () => void;
    isFullscreen?: boolean;
    onPanelToggle?: () => void;
}

export default function FlashcardsPanelControls({ onClose, isFullscreen, onPanelToggle }: Props) {
    return (
        <div className="flex flex-row">
            {onClose ? (
                <Button
                    className="text-muted-foreground hover:text-primary"
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            ) : null}
            {isFullscreen !== undefined && onPanelToggle ? (
                <Button
                    className="text-muted-foreground hover:text-primary"
                    size="icon"
                    variant="ghost"
                    onClick={onPanelToggle}
                >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            ) : null}
        </div>
    );
}
