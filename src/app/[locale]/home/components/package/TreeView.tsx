'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronRight,
    Folder,
    MoreVertical,
    Plus,
    Trash2,
    FolderOpen,
    Paperclip,
    Pencil,
    Package,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { PackageId, TopicId } from '@/services/package/package.type';
import {
    createPackage,
    deletePackage,
    fetchPackages,
    fetchTopicsByPackage,
    moveTopicToPackage,
    removeTopicInPackage,
    updatePackage,
} from '@/stores/features/package/package.thunk';
import { compareIgnoreCapitalization, isEmpty, isNilOrEmpty, safeDestructure, truncate } from '@/utils';
import { Modal } from '@/components/modal/Modal';
import { toast } from '@/hooks/use-toast';
import Spinner from '@/components/ui/spinner';
import { toggleExpendPackage } from '@/stores/features/package/packageSlice';
import ListTopicUnAssign from './ListTopicUnAssign';

export interface ITreeTopicItem {
    topicId: number | string;
    name: string;
}

export interface TreeViewProps {
    className?: string;
}

const TreeView: React.FC<TreeViewProps> = ({ className }) => {
    const dispatch = useAppDispatch();
    const t = useTranslations('packages');

    const { isLoading, isUpdating, packages, topicsByPackage, error, expendPackage, selectedTopicId } = useAppSelector(
        (state) => state.package,
    );

    const [newPackageName, setNewPackageName] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState<PackageId | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<PackageId | null>(null);
    const [pkgMenu, setPkgMenu] = useState<PackageId | null>(null);
    const [topicMenu, setTopicMenu] = useState<{ pkgId: PackageId; topicId: TopicId } | null>(null);
    const [renaming, setRenaming] = useState<{ pkgId: PackageId; name: string } | null>(null);
    const [isOpenListTopicsUnPackage, setIsOpenListTopicUnPackage] = useState<boolean>(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const toggle = async (id: PackageId) => {
        const willOpen = !(expendPackage[id] ?? false);

        dispatch(
            toggleExpendPackage({
                packageId: id,
            }),
        );

        if (willOpen) {
            const topics = topicsByPackage[id];
            if (isEmpty(topics)) {
                await dispatch(fetchTopicsByPackage(id));
            }
        }
    };

    const handleCreate = async () => {
        const title = newPackageName.trim();

        if (isNilOrEmpty(title)) return;

        try {
            await dispatch(
                createPackage({
                    title,
                    parentId: null,
                }),
            ).unwrap();

            setNewPackageName('');
            setIsCreateOpen(false);
        } catch {
            toast({ description: t('toast.createFail') });
        }
    };

    const handleRemoveTopic = async (topicId: TopicId, packageId: PackageId) => {
        try {
            await dispatch(
                removeTopicInPackage({
                    topicId,
                    packageId,
                }),
            );
        } catch (error) {
            toast({ description: t('toast.removeFail') });
        }
    };

    const handleDelete = async (id: PackageId) => {
        try {
            await dispatch(deletePackage({ packageId: id })).unwrap();
            setPendingDeleteId(null);
        } catch (e) {
            toast({ description: t('toast.deleteFail') });
        }
    };

    const handleMoveTopic = async (topicId: TopicId, oldPackageId: PackageId, newPackageId: PackageId) => {
        try {
            await dispatch(
                moveTopicToPackage({
                    topic: {
                        topicId: Number(topicId),
                    },
                    packageId: newPackageId,
                }),
            );

            const isClose = !expendPackage[newPackageId];

            if (isClose) {
                toggle(newPackageId);
            }
        } catch (error) {}
    };

    const handleRename = async () => {
        if (!renaming) return;
        const value = renaming.name.trim();
        if (isNilOrEmpty(value)) return setRenaming(null);

        try {
            await dispatch(
                updatePackage({
                    packageId: renaming.pkgId,
                    title: value,
                }),
            ).unwrap();
            setRenaming(null);
        } catch {
            toast({ title: t('toast.renameFail') });
        }
    };

    const renderCreatePackage = () => (
        <div className="px-1 pb-2">
            <Modal
                isOpen={isCreateOpen}
                setIsOpen={setIsCreateOpen}
                title={t('createTitle')}
                contentStyle="max-w-[520px]"
                trigger={
                    <Button size="sm" variant="ghost" className="w-full justify-start gap-2">
                        <Plus className="h-4 w-4 rounded-full" />
                        <span className="text-xs">{t('new')}</span>
                    </Button>
                }
                body={
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground" htmlFor="pkg-name">
                            {t('field.name')}
                        </label>
                        <Input
                            id="pkg-name"
                            autoFocus
                            value={newPackageName}
                            onChange={(e) => setNewPackageName(e.target.value)}
                            placeholder={t('placeholder.name')}
                        />
                    </div>
                }
                footer={
                    <Button onClick={handleCreate} disabled={isUpdating || !newPackageName.trim()}>
                        {isUpdating ? t('action.creating') : t('action.create')}
                    </Button>
                }
                cancel={<Button variant="outline">{t('action.cancel')}</Button>}
            />
        </div>
    );

    const isDisableModify = useMemo(() => {
        return isNilOrEmpty(renaming?.name?.trim()) || isUpdating;
    }, [renaming?.name, isUpdating]);

    useEffect(() => {
        dispatch(fetchPackages());
    }, []);

    if (isLoading) return <Spinner className="size-4 text-center mx-auto" />;

    return (
        <div className={cn('w-full text-sm', className)}>
            <div className="space-y-1">
                {packages?.map((pkg) => {
                    const isOpen = expendPackage[pkg.id] ?? false;

                    const { topics, isFetchingTopic } = safeDestructure(topicsByPackage[pkg.id]);

                    return (
                        <div key={pkg.id} className="rounded-md">
                            <DropdownMenu open={pkgMenu === pkg.id} onOpenChange={(o) => !o && setPkgMenu(null)}>
                                <DropdownMenuTrigger asChild>
                                    <div
                                        className={cn(
                                            'group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer',
                                        )}
                                        onClick={() => toggle(pkg.id)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setPkgMenu(pkg.id);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isOpen ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}

                                            {isOpen ? (
                                                <FolderOpen className="h-4 w-4 text-primary" />
                                            ) : (
                                                <Folder className="h-4 w-4 text-primary" />
                                            )}

                                            <span className="font-medium">{pkg?.title}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPkgMenu(pkg.id);
                                            }}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="p-2">
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRenaming({ pkgId: pkg.id, name: pkg?.title });
                                            setPkgMenu(null);
                                        }}
                                        className="text-xs"
                                    >
                                        <Pencil className="h-1 w-1" />
                                        <span className="text-xs">{t('menu.rename')}</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpenListTopicUnPackage(true);
                                            setSelectedPackageId(pkg.id);
                                            setPkgMenu(null);
                                        }}
                                        className="text-xs"
                                    >
                                        <Package className="h-2 w-2" />
                                        <span className="text-xs">{t('menu.insert')}</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingDeleteId(pkg.id);
                                            setPkgMenu(null);
                                        }}
                                        className="text-xs"
                                    >
                                        <Trash2 className="h-4 w-4" /> {t('menu.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {isFetchingTopic && <Spinner className="size-4 text-center mx-auto" />}

                            {/* Topics */}

                            {isOpen && !isFetchingTopic && (
                                <div className="ml-6 border-l pl-3">
                                    {topics && topics.length > 0 ? (
                                        <ul className="py-1">
                                            {topics.map((topic) => {
                                                const selected = compareIgnoreCapitalization(
                                                    String(selectedTopicId),
                                                    String(topic.topicId),
                                                );

                                                const packageAvailable = packages
                                                    .filter((p) => p.id !== pkg.id)
                                                    .map((target) => (
                                                        <DropdownMenuItem
                                                            key={target.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();

                                                                handleMoveTopic(topic.topicId, pkg.id, target.id);

                                                                setTopicMenu(null);
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            <Folder className="mr-2 h-4 w-4" /> {target.title}
                                                        </DropdownMenuItem>
                                                    ));

                                                return (
                                                    <li key={topic.topicId}>
                                                        <DropdownMenu
                                                            open={
                                                                topicMenu?.pkgId === pkg.id &&
                                                                topicMenu?.topicId === topic.topicId
                                                            }
                                                            onOpenChange={(o) => !o && setTopicMenu(null)}
                                                        >
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className={cn(
                                                                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent',
                                                                        selected && 'bg-accent',
                                                                    )}
                                                                    onContextMenu={(e) => {
                                                                        e.preventDefault();
                                                                        setTopicMenu({
                                                                            pkgId: pkg.id,
                                                                            topicId: topic.topicId,
                                                                        });
                                                                    }}
                                                                >
                                                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="truncate">
                                                                        {truncate(topic?.name, 18)}
                                                                    </span>
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveTopic(topic.topicId, pkg.id);
                                                                        setTopicMenu(null);
                                                                    }}
                                                                    className="text-xs"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />{' '}
                                                                    {t('menu.removeFromPackage')}
                                                                </DropdownMenuItem>
                                                                {packageAvailable && packageAvailable.length !== 0 && (
                                                                    <DropdownMenuSub>
                                                                        <DropdownMenuSubTrigger className="text-xs">
                                                                            {t('submenu.changePackage')}
                                                                        </DropdownMenuSubTrigger>
                                                                        <DropdownMenuSubContent>
                                                                            {packageAvailable}
                                                                        </DropdownMenuSubContent>
                                                                    </DropdownMenuSub>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="px-2 py-2 text-xs text-muted-foreground">
                                            {t('topics.none')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {renderCreatePackage()}
            </div>

            {/* Delete confirmation */}
            {pendingDeleteId != null && (
                <AlertDialog open onOpenChange={(open) => !open && setPendingDeleteId(null)}>
                    <AlertDialogTrigger asChild>
                        <span>{t('action.delete')}</span>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('dialog.deleteTitle')}</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="text-sm text-muted-foreground">{t('dialog.deleteBody')}</div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>
                                {t('action.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDelete(pendingDeleteId!)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> {t('action.delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {renaming && (
                <Dialog open onOpenChange={(o) => !o && setRenaming(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('dialog.renameTitle')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground" htmlFor="pkg-rename">
                                {t('field.name')}
                            </label>
                            <Input
                                id="pkg-rename"
                                autoFocus
                                value={renaming.name}
                                onChange={(e) => setRenaming((r) => (r ? { ...r, name: e.target.value } : r))}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button disabled={isUpdating} variant="outline">
                                    {t('action.cancel')}
                                </Button>
                            </DialogClose>
                            <Button onClick={handleRename} disabled={isDisableModify}>
                                {isUpdating ? t('action.saving') : t('action.save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {isOpenListTopicsUnPackage && (
                <ListTopicUnAssign
                    isOpenListTopicUnAssign={isOpenListTopicsUnPackage}
                    setIsOpenListTopicUnAssign={setIsOpenListTopicUnPackage}
                    packageId={selectedPackageId}
                />
            )}
        </div>
    );
};

export default TreeView;
