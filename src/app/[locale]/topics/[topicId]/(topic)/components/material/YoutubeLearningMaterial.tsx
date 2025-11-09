import { useEffect } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import youtubeLearningMaterialUtils from '../../utils/youtubeLearningMaterial.utils';
import { isNilOrEmpty } from '@/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
    embedUrl: string;
    content: string;
}

export default function YoutubeLearningMaterial({ embedUrl, content }: Props) {
    const { contentTextOrigin } = useTopicWorkspace();

    if (!youtubeLearningMaterialUtils.isValidYoutubeEmbed(embedUrl)) {
        return <div className="p-8 text-red-500">Invalid YouTube URL</div>;
    }

    useEffect(() => {
        if (!isNilOrEmpty(content)) {
            contentTextOrigin.current = content;
        }
    }, [content]);

    return (
        <ScrollArea className="flex flex-col gap-4 p-8 ">
            <iframe
                allowFullScreen={true}
                src={embedUrl}
                title="Youtube video player"
                className="w-full aspect-video rounded-2xl mb-2"
            />
            <p>{content}</p>
        </ScrollArea>
    );
}
