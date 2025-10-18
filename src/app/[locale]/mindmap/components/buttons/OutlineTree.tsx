import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface OutlineTreeProps {
    root: string;
    children: string[];
}

export default function OutlineTree({ root, children }: OutlineTreeProps) {
    return (
        <div className="w-full max-w-md mx-auto">
            <Accordion type="single" collapsible defaultValue="root">
                <AccordionItem value="root">
                    <AccordionTrigger className="text-lg font-semibold">{root}</AccordionTrigger>
                    <AccordionContent>
                        <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                            {children.map((child, i) => (
                                <li key={i}>{child}</li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
