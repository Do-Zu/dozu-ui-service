import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Inbox } from 'lucide-react';

interface Props {
    onClose?: () => void;
}

export default function EmptyNodeFlashcards({ onClose }: Props) {
    return (
        <div className="flex items-center justify-center w-full h-full p-8">
            <Card className="w-full max-w-md p-4 shadow-xl border-2 border-dashed border-muted-foreground/30">
                <div className="flex justify-end -mt-1 -mr-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-muted-foreground hover:bg-transparent hover:text-foreground/70"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <CardContent className="flex flex-col items-center justify-center space-y-4 p-4 -mt-4">
                    <Inbox className="h-10 w-10 text-primary/70" />

                    <h3 className="text-2xl font-semibold tracking-tight text-foreground">No Flashcards Found</h3>

                    <p className="text-center text-base text-muted-foreground max-w-xs">
                        Please generate or add some flashcards to this node to begin studying.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
