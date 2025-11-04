'use client';

import { Modal } from '@/components/modal/Modal';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PackageId } from '@/services/package/package.type';
import { moveTopicToPackage } from '@/stores/features/package/package.thunk';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { isNilOrEmpty, safeDestructure } from '@/utils';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { ITopic } from '../../types/topic.type';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Folder, Search, X } from 'lucide-react';
import { toggleExpendPackage } from '@/stores/features/package/packageSlice';

interface IProps {
    isOpenListPackage: boolean;
    setIsOpenListPackage: Dispatch<SetStateAction<boolean>>;
    topic: ITopic | null | undefined;
}
export default function ListPackage({ isOpenListPackage, setIsOpenListPackage, topic }: IProps) {
    const dispatch = useAppDispatch();
    const t = useTranslations('packages');

    const { packages, isLoading } = useAppSelector((state) => safeDestructure(state.package));

    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query.trim()) return packages ?? [];
        const q = query.trim().toLowerCase();
        return (packages ?? []).filter((p) => p.title.toLowerCase().includes(q));
    }, [packages, query]);

    const handleAddTopicInPackage = async (packageId: PackageId) => {
        if (isNilOrEmpty(topic)) {
            toast({ description: t('toast.moveFail.desc') });
            return;
        }

        try {
            await dispatch(
                moveTopicToPackage({
                    packageId,
                    topic: topic!,
                }),
            ).unwrap();

            dispatch(
                toggleExpendPackage({
                    packageId,
                    specificStatus: true,
                }),
            );

            toast({ description: t('toast.moveSuccess') });
            setIsOpenListPackage(false);
        } catch {
            toast({
                variant: 'destructive',
                title: t('toast.moveFail.title'),
            });
        }
    };

    const clearQuery = () => setQuery('');

    return (
        <Modal
            title=""
            isOpen={isOpenListPackage}
            setIsOpen={setIsOpenListPackage}
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

                    <Separator />

                    <ScrollArea className="max-h-72 pr-2">
                        <AnimatePresence mode="popLayout">
                            {isLoading && (!packages || packages.length === 0) ? (
                                <div className="text-sm text-muted-foreground p-4">{t('list.loading')}</div>
                            ) : filtered.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm text-muted-foreground p-4"
                                >
                                    {t('list.empty')}
                                </motion.div>
                            ) : (
                                <ul className="grid grid-cols-1 gap-2">
                                    {filtered.map((pkg, idx) => (
                                        <motion.li
                                            key={String(pkg.id)}
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
                                                onClick={() => handleAddTopicInPackage(pkg.id)}
                                            >
                                                <span className="inline-flex items-center justify-center rounded-md bg-muted p-1">
                                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                                </span>
                                                <span className="truncate text-sm">{pkg.title}</span>
                                            </Button>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </AnimatePresence>
                    </ScrollArea>
                </div>
            }
        />
    );
}
