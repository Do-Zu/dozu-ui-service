import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { ITopic } from '../../types/topic.type';
import Link from 'next/link';

export type ITopicDetails = Pick<ITopic, 'topicId' | 'name' | 'description' | 'createdAt'> & {
    lastStudied?: Date;
    numbers: {
        nodes: number;
        flashcards: number;
        quizzes: number;
    };
};

function TopicDetails({ topic }: { topic: ITopicDetails }) {
    const { name, description, createdAt, lastStudied, numbers } = topic;
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
            <div className="border rounded-xl p-4 flex justify-between">
                <div>
                    <p className="font-semibold text-muted-foreground">Nodes</p>
                    <p className="text-lg">{numbers.nodes}</p>
                </div>
                <div>
                    <p className="font-semibold text-muted-foreground">Flashcards</p>
                    <p className="text-lg">{numbers.flashcards}</p>
                </div>
                <div>
                    <p className="font-semibold text-muted-foreground">Quizzes</p>
                    <p className="text-lg">{numbers.quizzes}</p>
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
