import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import PreviewMindmap from './PreviewMindmap';
import { Button } from '@/components/ui/button';
import { postRequest } from '@/api/api';
import { ITopic } from '../../topics/types/topic.type';
import Axios from '@/api/axios';
import { Card } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

interface GenerateMindmapCardProps {
    mindmapData: any;
    topicName: string;
    setTopicName: (name: string) => void;
}

const GenerateMindmapCard = ({ mindmapData, topicName, setTopicName }: GenerateMindmapCardProps) => {
    const getUpdatedEdges = (oldId: any, newId: any, edges: any) => {
        const updatedEdges = edges.map((edge: any) => {
            if (edge.source === oldId) {
                edge.source = newId;
            }
            if (edge.target === oldId) {
                edge.target = newId;
            }
            return edge;
        });
        return updatedEdges;
    };

    const getUpdatedMindmapData = (nodes: any, edges: any) => {
        let updatedEdges = edges;
        const updatedNodes = mindmapData?.nodes?.map((node: any) => {
            const oldId = node.id;
            const nodeUuid = uuidv4();
            updatedEdges = getUpdatedEdges(oldId, nodeUuid, updatedEdges);
            node.id = nodeUuid;
            node.data.nodeId = nodeUuid;
            node.type = 'custom-react-flow-node';
            return node;
        });
        return { nodes: updatedNodes, edges: updatedEdges };
    };

    const updatedMindmapData = getUpdatedMindmapData(mindmapData.nodes, mindmapData.edges);

    const handleSaveTopicAndMindmap = async () => {
        const dataSubmitted = { name: topicName, description: 'Description' };
        const topicData = await postRequest<any, ITopic>('/topics', dataSubmitted);
        const topicId = topicData.data.topicId;

        const options: any = {
            body: {
                title: 'a',
                nodes: updatedMindmapData.nodes,
                edges: updatedMindmapData.edges,
            },
        };
        const response = await Axios.post(`/mindmap/${topicId}`, options.body);
    };

    return (
        <div>
            <div className="grid w-full max-w-sm items-center gap-3">
                <Card>
                    <Label htmlFor="topicName">Topic name</Label>
                    <Input
                        id="topicName"
                        placeholder="Topic name"
                        value={topicName}
                        onChange={(e) => {
                            setTopicName(e.target.value);
                        }}
                    />
                    <PreviewMindmap initialNodes={updatedMindmapData.nodes} initialEdges={updatedMindmapData.edges} />
                    <Button disabled={topicName ? false : true} onClick={handleSaveTopicAndMindmap}>
                        Save to topic
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default GenerateMindmapCard;
