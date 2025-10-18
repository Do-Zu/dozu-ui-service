import { Button } from '@/components/ui/button';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { useReactFlow } from '@xyflow/react';
import { Import } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';
import { useSetMindmapLayout } from '@/app/[locale]/mindmap/hooks/useSetMindmapLayout';

interface ImportButtonProps {
    isPanelExpanded: boolean;
}

const ImportButton = ({ isPanelExpanded }: ImportButtonProps) => {
    const t = useTranslations('ImportButton');
    const [shouldLayout, setShouldLayout] = useState(false);

    const { setNodes, setEdges } = useReactFlow<AppNode, AppEdge>();
    const [csvInput, setCsvInput] = useState('');

    const onLayout = useSetMindmapLayout();

    const handleOnClickImport = () => {
        handleImportCSV(csvInput);
    };
    const handleImportCSV = (text: string) => {
        if (!text.trim()) return;

        try {
            // const rows = text
            //     .trim()
            //     .split('\n')
            //     .map((row) => row.split(','));
            const parsedData = Papa.parse<string[]>(text);

            const dataRows = parsedData.data.slice(1); // skip header (0,1,2,...)

            if (dataRows.length === 0) {
                toastHelper.showErrorMessage(t('DataErrorText'));
                return;
            }

            const { nodes, edges } = reconstructGraphFromCSV(dataRows);

            setNodes(nodes);
            setEdges(edges);
            setShouldLayout(true);
            toastHelper.showSuccessMessage(t('ImportSuccessfulText'));
        } catch (error) {
            console.error('CSV import error:', error);
            // toast({
            //     title: 'Import failed',
            //     description: 'Failed to parse CSV. Please check the format.',
            //     variant: 'destructive',
            // });
            toastHelper.showErrorMessage(t('FailedToImportErrorText'));
        }
    };

    const reconstructGraphFromCSV = (rows: string[][]) => {
        const nodes: AppNode[] = [];
        const edges: AppEdge[] = [];
        const nodeSet = new Map<string, string>(); // label -> id
        let hasRoot = false;

        const getNodeId = (label: string) => {
            //needs isRoot mechanism
            if (!nodeSet.has(label)) {
                const id = uuidv4();
                nodeSet.set(label, id);
                nodes.push({
                    id,
                    data: { label, nodeId: id, isRoot: hasRoot ? false : true },
                    type: 'custom-react-flow-node',
                    position: { x: 0, y: 0 },
                });
                hasRoot = true;
            }
            return nodeSet.get(label)!;
        };

        for (const row of rows) {
            const validCells = row.filter(Boolean);
            for (let i = 0; i < validCells.length - 1; i++) {
                const sourceId = getNodeId(validCells[i]);
                const targetId = getNodeId(validCells[i + 1]);

                edges.push({
                    id: `${sourceId}-${targetId}`,
                    source: sourceId,
                    target: targetId,
                    type: 'floating',
                });
            }
        }

        return { nodes, edges };
    };

    // Watch nodes — when they change *and* the flag is true, trigger layout
    useEffect(() => {
        if (shouldLayout) {
            onLayout({ direction: 'DOWN' });
            setShouldLayout(false); // reset flag
        }
    }, [shouldLayout, onLayout]);

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild className="w-full">
                    <Button variant="outline">
                        <Import />
                        {isPanelExpanded ? t('ImportButtonLabel') : ''}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('ImportDialogTitle')}</DialogTitle>
                        <DialogDescription>{t('ImportDialogDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">CSV</Label>
                            <Textarea
                                id="name-1"
                                name="name"
                                value={csvInput}
                                onChange={(e) => setCsvInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{t('CancelButtonLabel')}</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button
                                type="submit"
                                onClick={() => {
                                    handleOnClickImport();
                                }}
                            >
                                {t('ConfirmImportButtonLabel')}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default ImportButton;
