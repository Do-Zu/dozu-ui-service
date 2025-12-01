import React, { memo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTopicWorkspace } from '../../topics/[topicId]/(topic)/context/TopicWorkspaceContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isEmpty, isNilOrEmpty, isNumber, toNumber } from '@/utils';
import DataStatus from '@/components/errors/DataStatus';
import { IReturnItemFileReference, MetaDataFileContent } from '../../topics/[topicId]/(topic)/types';
import { toast } from '@/hooks/use-toast';

interface ReferenceDocumentViaPageProps {
    references: IReturnItemFileReference[];
    isEditing: boolean;
    pageStartIndex?: number;
    pageEndIndex?: number;
    setPageStartIndex: (page: number | undefined) => void;
    setPageEndIndex: (page: number | undefined) => void;
    onChangePageStartIndex: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangePageEndIndex: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ReferenceDocumentViaPage = ({
    references,
    isEditing,
    pageStartIndex,
    pageEndIndex,
    setPageStartIndex,
    setPageEndIndex,
    onChangePageStartIndex,
    onChangePageEndIndex,
}: ReferenceDocumentViaPageProps) => {
    const t = useTranslations('topic.reference');
    const { setPageNumber } = useTopicWorkspace();

    const handleReferenceOriginContent = useCallback((pageNumber?: number) => {
        if (isEditing) return;

        if (isNilOrEmpty(pageNumber) || !isNumber(pageNumber) || toNumber(pageNumber) <= 0) {
            toast({
                description: t('pageInvalid'),
            });
            return;
        }

        setPageNumber(pageNumber!);
    }, []);

    useEffect(() => {
        if (isEmpty(references)) return;

        const highestPageIndex = (references[0].metadata as MetaDataFileContent).pageNumber;

        const sortPageIndex = references
            .filter((item) => !!item.metadata)
            .sort((a, b) => a.metadata!.pageNumber - b.metadata!.pageNumber);

        const indexItem = sortPageIndex.findIndex((item) => item.metadata?.pageNumber === highestPageIndex);

        let startIndex = indexItem;
        let endIndex = indexItem;

        const length = references.length;

        while (startIndex > 0) {
            const previousIndex = startIndex - 1;

            if (
                sortPageIndex[previousIndex].metadata!.pageNumber !==
                sortPageIndex[startIndex].metadata!.pageNumber - 1
            ) {
                break;
            }

            startIndex = previousIndex;
        }

        while (endIndex < length - 1) {
            const nextIndex = endIndex + 1;
            if (sortPageIndex[nextIndex].metadata!.pageNumber !== sortPageIndex[endIndex].metadata!.pageNumber + 1) {
                break;
            }

            endIndex = nextIndex;
        }

        const newPageStartIndex = sortPageIndex[startIndex].metadata!.pageNumber;
        const newPageEndIndex = sortPageIndex[endIndex].metadata!.pageNumber;

        setPageStartIndex(newPageStartIndex);
        setPageEndIndex(newPageEndIndex);
    }, [references, setPageStartIndex, setPageEndIndex]);

    if (isEmpty(references)) return <DataStatus variant="empty" />;

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label className="text-sm font-medium">Start Page</Label>
                {isEditing ? (
                    <Input type="number" value={pageStartIndex ?? ''} onChange={onChangePageStartIndex} />
                ) : (
                    <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="default"
                                className="mx-2 justify-start text-left font-normal"
                                onClick={() => handleReferenceOriginContent(pageStartIndex)}
                            >
                                {pageStartIndex ?? 'N/A'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Click to view content</TooltipContent>
                    </Tooltip>
                )}
            </div>
            <div className="space-y-1">
                <Label className="text-sm font-medium">End Page</Label>
                {isEditing ? (
                    <Input type="number" value={pageEndIndex ?? ''} onChange={onChangePageEndIndex} />
                ) : (
                    <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="default"
                                className="mx-2 justify-start text-left font-normal"
                                onClick={() => handleReferenceOriginContent(pageEndIndex)}
                            >
                                {pageEndIndex ?? '—'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Click to view content</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    );
};

export default memo(ReferenceDocumentViaPage);
