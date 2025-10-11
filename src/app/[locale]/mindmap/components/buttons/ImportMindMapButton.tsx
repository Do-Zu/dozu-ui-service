import { Button } from '@/components/ui/button';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { addChildNode, deleteNode } from '@/utils/mindmap/mindmapUtils';
import { useReactFlow } from '@xyflow/react';
import { Import, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { useMindMapContext } from '../../context/MindMapContext';
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

const ImportMindmapButton = () => {
    const { setNodes, setEdges } = useReactFlow<AppNode, AppEdge>();
    const [csvInput, setCsvInput] = useState('');

    const handleOnClickImport = () => {
        // e.preventDefault();
        // deleteNode({ nodeId: nodeId, edges, setNodes, setEdges });
        console.log('csv', csvInput);
        handleImportCSV(csvInput);
    };
    const handleImportCSV = (text: string) => {
        if (!text.trim()) return;

        const rows = text
            .trim()
            .split('\n')
            .map((row) => row.split(','));
        const dataRows = rows.slice(1); // skip header (0,1,2,...)

        const { nodes, edges } = reconstructGraphFromCSV(dataRows);
        console.log('Imported graph:', { nodes, edges });

        setNodes(nodes);
        setEdges(edges);
    };

    const reconstructGraphFromCSV = (rows: string[][]) => {
        const nodes: AppNode[] = [];
        const edges: AppEdge[] = [];
        const nodeSet = new Map<string, string>(); // label -> id

        const getNodeId = (label: string) => {
            if (!nodeSet.has(label)) {
                const id = crypto.randomUUID();
                nodeSet.set(label, id);
                nodes.push({
                    id,
                    data: { label, nodeId: id },
                    type: 'custom-react-flow-node',
                    position: { x: 0, y: 0 },
                });
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

    return (
        <Dialog>
            <form >
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Import />
                        Import
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Import mindmap</DialogTitle>
                        <DialogDescription>Import mindmap from csv</DialogDescription>
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
                        {/* <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div> */}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            onClick={() => {
                                handleOnClickImport();
                            }}
                        >
                            Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default ImportMindmapButton;
