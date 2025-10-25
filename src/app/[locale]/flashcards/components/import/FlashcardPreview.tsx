import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type IFlashcardPreview = { front: string; back: string };

export default function FlashcardsPreview({ flashcards }: { flashcards: IFlashcardPreview[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[10%]">#</TableHead>
                    <TableHead className="w-[30%]">Front</TableHead>
                    <TableHead className="w-[60%]">Back</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {flashcards.map((card, index) => (
                    <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{card.front}</TableCell>
                        <TableCell className="text-muted-foreground">{card.back}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
