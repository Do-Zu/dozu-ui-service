import { useEffect } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import youtubeLearningMaterialUtils from '../../utils/youtubeLearningMaterial.utils';
import { isNilOrEmpty } from '@/utils';

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
        <div className="flex flex-col gap-4 p-8 overflow-y-scroll">
            <iframe
                allowFullScreen={true}
                src={embedUrl}
                title="Youtube video player"
                className="w-full aspect-video"
            />
            <p>{content}</p>
        </div>
    );
}
