import { ReactNode, useState, cloneElement, isValidElement } from 'react';
import useGenerateStream, { ISseDataStream } from '../../hooks/generate/useGenerateStream';

interface IGenerateStreaming {
    trigger: ReactNode;
    previewComponent?: ReactNode | ((data: any) => ReactNode);
    loadingComponent?: ReactNode;
    previewStreamingComponent?: ReactNode | ((data: any) => ReactNode);
    content: string;
    type: string;
    method?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

const GenerateStreaming = ({
    trigger,
    previewComponent,
    loadingComponent,
    previewStreamingComponent,
    content,
    type,
    method = 'POST',
    onSuccess,
    onError,
}: IGenerateStreaming) => {
    const [streamData, setStreamData] = useState<string>('');
    const [isCompleted, setIsCompleted] = useState(false);

    const { execute, isGenerating, reset } = useGenerateStream({
        onChunk: (chunk: ISseDataStream) => {
            if (chunk && typeof chunk === 'object' && 'data' in chunk) {
                const data = (chunk as any).data;
                if (typeof data === 'string') {
                    setStreamData((prev) => prev + data);
                }
            }
        },
        onSuccess: (data) => {
            setIsCompleted(true);
            if (onSuccess) onSuccess(data);
        },
        onError: (err) => {
            if (onError) onError(err);
        },
    });

    const handleClick = () => {
        setStreamData('');
        setIsCompleted(false);
        reset();
        execute({ content, method, type });
    };

    const renderContent = (component: ReactNode | ((data: any) => ReactNode), data: any) => {
        if (typeof component === 'function') {
            return component(data);
        }
        if (isValidElement(component)) {
            return cloneElement(component as any, { data });
        }
        return component;
    };

    if (isGenerating) {
        return (
            <>{previewStreamingComponent ? renderContent(previewStreamingComponent, streamData) : loadingComponent}</>
        );
    }

    if (isCompleted) {
        return <>{previewComponent ? renderContent(previewComponent, streamData) : <div>{streamData}</div>}</>;
    }

    if (isValidElement(trigger)) {
        return cloneElement(trigger as any, { onClick: handleClick });
    }

    return <div onClick={handleClick}>{trigger}</div>;
};

export default GenerateStreaming;
