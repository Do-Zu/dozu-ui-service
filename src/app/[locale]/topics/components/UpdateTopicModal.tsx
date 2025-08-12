import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;

    topicId: number | null | undefined;
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (description: string) => void;
    handleUpdateClick: ({ topicId, name, description }: { topicId: number; name: string; description: string }) => void;

    loading?: boolean;
}

export function UpdateTopicModal({
    isOpen,
    setIsOpen,
    topicId,
    name,
    setName,
    description,
    setDescription,
    handleUpdateClick,
    loading,
}: Props) {
    function handleOnChangeName(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function handleOnChangeDescription(event: ChangeEvent<HTMLInputElement>) {
        setDescription(event.target.value);
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Update Topic"
            body={
                topicId ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="text-primary text-base font-normal">Name</div>
                            <Input value={name} onChange={handleOnChangeName} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="text-primary text-base font-normal">Description</div>
                            <Input value={description} onChange={handleOnChangeDescription} />
                        </div>

                        <div>
                            <Button
                                className="text-base"
                                onClick={() => handleUpdateClick({ topicId, name, description })}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Update'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>TopicId is empty</div>
                )
            }
        />
    );
}
