import { Textarea } from '@/components/ui/textarea';

const FlashcardStreamPreview = ({ items }: { items: string[] }) => {
    return (
        <div className="w-full max-w-2xl rounded-md border border-input bg-background px-4 py-3 text-sm shadow-sm">
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div
                        key={`${index}-${item.slice(0, 24)}`}
                        className="flex flex-col rounded-xl border bg-muted/60 p-6 text-card-foreground shadow-sm dark:bg-muted/40"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <Textarea
                                placeholder="Card..."
                                value={item}
                                className="
                                                min-h-[70px] resize-none
                                                rounded-lg border
                                                border-border bg-input
                                                text-card-foreground placeholder:text-muted-foreground/60
                                                focus-visible:ring-1
                                                focus-visible:ring-primary/60
                                                dark:bg-muted
                                        "
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlashcardStreamPreview;
