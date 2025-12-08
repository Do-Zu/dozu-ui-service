import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PdfReferenceItemProps {
    id?: string | undefined;
    label: string;
    isEditing: boolean;
    pageIndex: number | undefined;
    onPageIndexChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPageClick: (page: number | undefined) => void;
}

function PdfReferenceItem({ id, label, isEditing, pageIndex, onPageIndexChange, onPageClick }: PdfReferenceItemProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1">
                <Label htmlFor={id} className="text-xs text-muted-foreground">
                    {label}
                </Label>
            </div>

            {isEditing ? (
                <Input
                    id={id}
                    type="number"
                    value={pageIndex}
                    onChange={onPageIndexChange}
                    placeholder="E.g. 1"
                    min={0}
                    className="h-9 text-sm transition-all"
                />
            ) : null}

            {!isEditing ? (
                <TooltipProvider>
                    <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                            <Button variant="outline" onClick={() => onPageClick(pageIndex)}>
                                {pageIndex === undefined ? 'No page index yet' : pageIndex}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-sm">
                            <p className="font-medium">Click to preview content for this page.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : null}
        </div>
    );
}

interface Props {
    isEditing: boolean;
    pageStartIndex: number | undefined;
    onPageStartIndexChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    pageEndIndex: number | undefined;
    onPageEndIndexChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPageClick: (page: number | undefined) => void;
}

export default function PdfReferenceEdit({
    isEditing,
    pageStartIndex,
    onPageStartIndexChange,
    pageEndIndex,
    onPageEndIndexChange,
    onPageClick,
}: Props) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <PdfReferenceItem
                id="page-start"
                label="Page Start Index"
                isEditing={isEditing}
                pageIndex={pageStartIndex}
                onPageIndexChange={onPageStartIndexChange}
                onPageClick={onPageClick}
            />

            <PdfReferenceItem
                id="page-end"
                label="Page End Index"
                isEditing={isEditing}
                pageIndex={pageEndIndex}
                onPageIndexChange={onPageEndIndexChange}
                onPageClick={onPageClick}
            />
        </div>
    );
}
