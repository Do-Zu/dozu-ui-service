interface Props {
    embedUrl: string;
    content: string;
}

export default function YoutubeLearningMaterial({ embedUrl, content }: Props) {
    return (
        <div className="flex flex-col gap-4 p-8 overflow-y-scroll">
            <iframe allowFullScreen={true} src={embedUrl} />
            <p>{content}</p>
        </div>
    );
}
