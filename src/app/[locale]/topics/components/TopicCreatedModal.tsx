import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;

    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (description: string) => void;
    handleCreateClick: ({ name, description }: { name: string; description: string }) => void;
}

export function TopicCreatedModal({
    isOpen,
    setIsOpen,
    name,
    setName,
    description,
    setDescription,
    handleCreateClick,
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
            title="Create New Topic"
            body={
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
                        <Button className="text-base" onClick={() => handleCreateClick({ name, description })}>
                            Create
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
