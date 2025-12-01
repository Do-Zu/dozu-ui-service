import React, { memo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTopicWorkspace } from '../../topics/[topicId]/(topic)/context/TopicWorkspaceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isEmpty, isNilOrEmpty, isNumber, toNumber } from '@/utils';
import DataStatus from '@/components/errors/DataStatus';
import { IReturnItemFileReference, MetaDataFileContent } from '../../topics/[topicId]/(topic)/types';
import { toast } from '@/hooks/use-toast';

interface ReferenceDocumentViaPageProps {
    references: IReturnItemFileReference[];
    isEditing: boolean;
    pageStartIndex?: number;
    pageEndIndex?: number;
    setPageStartIndex: (page: any) => void;
    setPageEndIndex: (page: any) => void;
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
            <div className="space-y-1" onClick={() => handleReferenceOriginContent(pageStartIndex)}>
                <Label className="text-sm font-medium">Start Page</Label>
                {isEditing ? (
                    <Input type="number" value={pageStartIndex ?? ''} onChange={onChangePageStartIndex} />
                ) : (
                    <p className="text-sm text-muted-foreground">{pageStartIndex ?? 'N/A'}</p>
                )}
            </div>
            <div className="space-y-1" onClick={() => handleReferenceOriginContent(pageEndIndex)}>
                <Label className="text-sm font-medium">End Page</Label>
                {isEditing ? (
                    <Input type="number" value={pageEndIndex ?? ''} onChange={onChangePageEndIndex} />
                ) : (
                    <p className="text-sm text-muted-foreground">{pageEndIndex ?? '—'}</p>
                )}
            </div>
        </div>
    );
};

export default memo(ReferenceDocumentViaPage);
