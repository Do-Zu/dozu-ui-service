'use client';

import { Modal } from '@/components/modal/Modal';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GetTopicUnAssignedPackagesRequest, PackageId, TopicId, TopicItem } from '@/services/package/package.type';
import { useAppDispatch } from '@/stores/hooks';
import { isEmpty, isNilOrEmpty, validateArray } from '@/utils';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PackageX, Paperclip, Search, X } from 'lucide-react';
import usePost from '@/hooks/usePost';
import { packageService } from '@/services/package/package.service';
import Spinner from '@/components/ui/spinner';
import { moveTopicToPackage } from '@/stores/features/package/package.thunk';
import { toggleExpendPackage } from '@/stores/features/package/packageSlice';
import { toast } from '@/hooks/use-toast';

interface IProps {
    isOpenListTopicUnAssign: boolean;
    setIsOpenListTopicUnAssign: Dispatch<SetStateAction<boolean>>;
    packageId: PackageId | null;
}

const DEFAULT_LIMIT = 20;
const INIT_OFFSET = 0;

export default function ListTopicUnAssign({ isOpenListTopicUnAssign, setIsOpenListTopicUnAssign, packageId }: IProps) {
    const dispatch = useAppDispatch();

    const [offset, setOffset] = useState<number>(INIT_OFFSET);

    const t = useTranslations('packages');

    const [query, setQuery] = useState('');

    const {
        loading: isLoading,
        error,
        execute,
        data,
    } = usePost<GetTopicUnAssignedPackagesRequest, TopicItem[]>(packageService.getTopicUnAssignedForPackage);

    const handleAddTopicInPackage = async (topicId: TopicId) => {
        if (isNilOrEmpty(packageId) || isNilOrEmpty(topicId)) return;

        try {
            await dispatch(
                moveTopicToPackage({
                    packageId: packageId!,
                    topic: {
                        topicId: Number(topicId),
                    },
                }),
            ).unwrap();

            dispatch(
                toggleExpendPackage({
                    packageId,
                    specificStatus: true,
                }),
            );
        } catch {
            toast({ description: t('toast.moveFail.title') });
        } finally {
            setIsOpenListTopicUnAssign(false);
        }
    };

    const clearQuery = () => setQuery('');

    const contentRender = () => {
        if (isLoading && !error) {
            return <Spinner />;
        }

        if (isEmpty(data)) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-40 flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground"
                >
                    <PackageX className="h-5 w-5" />
                    <span>{t('topics.none')}</span>
                </motion.div>
            );
        }

        return (
            <div>
                <ul className="grid grid-cols-1 gap-2">
                    {validateArray<TopicItem>(data).map((topic, idx) => (
                        <motion.li
                            key={String(topic.topicId)}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{
                                delay: idx * 0.02,
                                type: 'spring',
                                stiffness: 320,
                                damping: 26,
                            }}
                        >
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 rounded-md px-3 py-2 hover:bg-accent"
                                onClick={() => handleAddTopicInPackage(topic.topicId)}
                            >
                                <span className="inline-flex items-center justify-center rounded-md bg-muted p-1">
                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <span className="truncate text-sm">{topic?.name}</span>
                            </Button>
                        </motion.li>
                    ))}
                </ul>
            </div>
        );
    };

    useEffect(() => {
        if (!isOpenListTopicUnAssign || isNilOrEmpty(packageId)) return;

        execute({
            packageId: packageId!,
            limit: DEFAULT_LIMIT,
            offset,
        });
    }, [isOpenListTopicUnAssign, packageId]);

    return (
        <Modal
            title=""
            isOpen={isOpenListTopicUnAssign}
            setIsOpen={setIsOpenListTopicUnAssign}
            contentStyle="max-w-[520px]"
            body={
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('search.placeholder')}
                                className="pl-8"
                            />
                            {query && (
                                <button
                                    aria-label="Clear search"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={clearQuery}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <Separator className="mt-4" />

                    <ScrollArea className="max-h-72 pr-2">
                        <AnimatePresence mode="popLayout">{contentRender()}</AnimatePresence>
                    </ScrollArea>
                </div>
            }
        />
    );
}
