import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    code: string;
    setCode: (value: string) => void;

    handleJoinClick: (classId: string) => void;
}

export function JoinClassModal({ isOpen, setIsOpen, code, setCode, handleJoinClick }: Props) {
    function handleCodeChange(event: ChangeEvent<HTMLInputElement>) {
        setCode(event.target.value);
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Join Class"
            description="Enter your Class Id provided by your Teacher to join Class"
            body={
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">Name</div>
                        <Input value={code} onChange={handleCodeChange} />
                    </div>

                    <div className='flex justify-end'>
                        <Button className="text-base" onClick={() => handleJoinClick(code)}>
                            Join
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
