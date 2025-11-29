import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { ITopic } from '../../types/topic.type';
import Link from 'next/link';

export type ITopicDetails = Pick<ITopic, 'topicId' | 'name' | 'description' | 'createdAt' | 'flashcardCounts'> & {
    lastStudied?: Date;
};

function TopicDetails({ topic }: { topic: ITopicDetails }) {
    const { name, description, createdAt, lastStudied, flashcardCounts } = topic;
    return (
        <div className="space-y-6">
            {/* Title & Description */}
            <div className="border rounded-xl p-4 space-y-2">
                <div>
                    <p className="text-sm font-semibold text-muted-foreground">Title:</p>
                    <p className="text-base">{name}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                        {description ? 'Description:' : 'No description'}
                    </p>
                    {description ?? <p className="text-base">{description}</p>}
                </div>
            </div>

            {/* Group: Numbers */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Flashcards</p>
                <div className="border rounded-xl p-3 flex justify-between">
                    <div>
                        <p className="font-semibold text-muted-foreground">Total</p>
                        <p className="text-lg">{flashcardCounts?.total || 0}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-muted-foreground">New</p>
                        <p className="text-lg">{flashcardCounts?.new || 0}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-muted-foreground">Learning</p>
                        <p className="text-lg">{flashcardCounts?.learning || 0}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-muted-foreground">Due</p>
                        <p className="text-lg">{flashcardCounts?.review || 0}</p>
                    </div>
                </div>
            </div>

            {/* Group: Dates */}
            <div className="grid grid-cols-2 gap-4 border rounded-xl p-4">
                <div>
                    <p className="font-semibold text-muted-foreground">Created At</p>
                    <p className="text-base">{new Date(createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="font-semibold text-muted-foreground">Last Studied</p>
                    <p className="text-base">{lastStudied ? new Date(lastStudied).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>

            {/* Progress link */}
            <div>
                <Link className="hover:underline" href="/">
                    View Progress
                </Link>
            </div>
        </div>
    );
}

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    topic?: ITopicDetails | null;
}

export default function TopicDetailsModal({ isOpen, setIsOpen, topic }: Props) {
    if (!topic) {
        return null;
    }
    return <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Topic details" body={<TopicDetails topic={topic} />} />;
}
