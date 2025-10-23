'use client';

import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PackageId } from '@/services/package/package.type';
import { moveTopicToPackage } from '@/stores/features/package/package.thunk';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { isNilOrEmpty, safeDestructure } from '@/utils';
import { Dispatch, SetStateAction } from 'react';
import { ITopic } from '../../types/topic.type';
import { toast } from '@/hooks/use-toast';

interface IProps {
    isOpenListPackage: boolean;
    setIsOpenListPackage: Dispatch<SetStateAction<boolean>>;
    topic: ITopic | null | undefined;
}
export default function ListPackage({ isOpenListPackage, setIsOpenListPackage, topic }: IProps) {
    const dispatch = useAppDispatch();

    const { packages } = useAppSelector((state) => safeDestructure(state.package));

    const handleAddTopicInPackage = async (packageId: PackageId) => {
        if (isNilOrEmpty(topic)) {
            toast({
                description: 'Select topic first, Please',
            });
            return;
        }

        try {
            await dispatch(
                moveTopicToPackage({
                    packageId,
                    topic: topic!,
                }),
            );
        } catch (error) {
            toast({
                description: 'update fail',
            });
        } finally {
            setIsOpenListPackage(false);
        }
    };

    return (
        <Modal
            body={
                <ScrollArea>
                    <div className="max-h-60 flex flex-col">
                        {packages?.map((pkg) => (
                            <Button onClick={() => handleAddTopicInPackage(pkg.id)} className="m-2">
                                {pkg?.title}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            }
            title=""
            isOpen={isOpenListPackage}
            setIsOpen={setIsOpenListPackage}
            contentStyle="max-w-[500px]"
        />
    );
}
