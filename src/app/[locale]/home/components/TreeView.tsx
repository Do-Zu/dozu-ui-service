'use client';

import React, { useEffect, useState } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { PackageItem } from '@/services/package/package.type';
import {
    createPackage,
    deletePackage,
    fetchPackages,
    fetchTopicsByPackage,
} from '@/stores/features/package/package.thunk';
import { isEmpty, isNilOrEmpty, safeDestructure } from '@/utils';
import { Modal } from '@/components/modal/Modal';
import { toast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { toggleExpendPackage } from '@/stores/features/package/packageSlice';

export interface ITreeTopicItem {
    topicId: number | string;
    name: string;
}

type SelectTopicHandler = (topic: ITreeTopicItem, pkg: PackageItem) => void;
type RenamePackageHandler = (id: string | number, name: string) => void | Promise<void>;
type RemoveTopicHandler = (topicId: string | number, pkgId: string | number) => void | Promise<void>;
type MoveTopicHandler = (
    topicId: string | number,
    fromPkgId: string | number,
    toPkgId: string | number,
) => void | Promise<void>;

export interface TreeViewProps {
    onRenamePackage?: RenamePackageHandler;
    onRemoveTopic?: RemoveTopicHandler;
    onMoveTopic?: MoveTopicHandler;
    onSelectTopic?: SelectTopicHandler;
    className?: string;
    selectedTopicId?: string | number;
}

const TreeView: React.FC<TreeViewProps> = ({
    onSelectTopic,
    onRenamePackage,
    onRemoveTopic,
    onMoveTopic,
    className,
    selectedTopicId,
}) => {
    const dispatch = useAppDispatch();

    const { isLoading, packages, topicsByPackage, error, expendPackage } = useAppSelector((state) => state.package);

    const [newPackageName, setNewPackageName] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);
    const [pkgMenu, setPkgMenu] = useState<string | number | null>(null);
    const [topicMenu, setTopicMenu] = useState<{ pkgId: string | number; topicId: string | number } | null>(null);
    const [renaming, setRenaming] = useState<{ pkgId: string | number; name: string } | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const toggle = async (id: string | number) => {
        const willOpen = !(expendPackage[id] ?? false);

        dispatch(toggleExpendPackage(id));

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

            await dispatch(fetchPackages());

            setNewPackageName('');
            setIsCreateOpen(false);
        } catch {
            toast({
                description: 'create package fail!',
            });
        }
    };

    const handleDelete = async (id: string | number) => {
        await dispatch(
            deletePackage({
                packageId: id,
            }),
        );
    };

    const handleRename = async () => {
        if (!renaming) return;
        const value = renaming.name.trim();
        if (!value) return setRenaming(null);
        if (onRenamePackage) {
            await onRenamePackage(renaming.pkgId, value);
        }
        setRenaming(null);
    };

    const renderCreatePackage = () => (
        <div className="px-1 pb-2">
            <Modal
                isOpen={isCreateOpen}
                setIsOpen={setIsCreateOpen}
                title={'Create package'}
                trigger={
                    <Button size="sm" variant="ghost" className="w-full justify-start gap-2">
                        <Plus className="h-4 w-4 rounded-full" />
                        <span className="text-xs">New package</span>
                    </Button>
                }
                body={
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground" htmlFor="pkg-name">
                            Name
                        </label>
                        <Input
                            id="pkg-name"
                            autoFocus
                            value={newPackageName}
                            onChange={(e) => setNewPackageName(e.target.value)}
                            placeholder="e.g. Development"
                        />
                    </div>
                }
                footer={
                    <Button onClick={handleCreate} disabled={isLoading || !newPackageName.trim()}>
                        {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                }
                cancel={<Button variant="outline">Cancel</Button>}
            />
        </div>
    );

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

                    if (isFetchingTopic) return <Spinner className="size-4 text-center mx-auto" />;

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

                                            <span
                                                className="inline-flex h-2 w-2 rounded-full"
                                                style={{ backgroundColor: '#94a3b8' }}
                                            />

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
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRenaming({ pkgId: pkg.id, name: pkg?.title });
                                            setPkgMenu(null);
                                        }}
                                        className="text-xs"
                                    >
                                        <Pencil className="h-2 w-2" />
                                        <span className="text-xs">Change name</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingDeleteId(pkg.id);
                                            setPkgMenu(null);
                                        }}
                                        className="text-xs"
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete package
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Topics */}
                            {isOpen && (
                                <div className="ml-6 border-l pl-3">
                                    {}
                                    {topics && topics.length > 0 ? (
                                        <ul className="py-1">
                                            {topics.map((t) => {
                                                const selected = selectedTopicId === t.topicId;
                                                return (
                                                    <li key={t.topicId}>
                                                        <DropdownMenu
                                                            open={
                                                                topicMenu?.pkgId === pkg.id &&
                                                                topicMenu?.topicId === t.topicId
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
                                                                    onClick={() => onSelectTopic?.(t, pkg)}
                                                                    onContextMenu={(e) => {
                                                                        e.preventDefault();
                                                                        setTopicMenu({
                                                                            pkgId: pkg.id,
                                                                            topicId: t.topicId,
                                                                        });
                                                                    }}
                                                                >
                                                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="truncate">{t.name}</span>
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    disabled={!onRemoveTopic}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (onRemoveTopic)
                                                                            onRemoveTopic(t.topicId, pkg.id);
                                                                        setTopicMenu(null);
                                                                    }}
                                                                    className="text-xs"
                                                                >
                                                                    <Trash2 className="h-4 w-4" /> Remove from package
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSub>
                                                                    <DropdownMenuSubTrigger className="text-xs">
                                                                        Change package
                                                                    </DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent>
                                                                        {packages
                                                                            .filter((p) => p.id !== pkg.id)
                                                                            .map((target) => (
                                                                                <DropdownMenuItem
                                                                                    key={target.id}
                                                                                    disabled={!onMoveTopic}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (onMoveTopic)
                                                                                            onMoveTopic(
                                                                                                t.topicId,
                                                                                                pkg.id,
                                                                                                target.id,
                                                                                            );
                                                                                        setTopicMenu(null);
                                                                                    }}
                                                                                    className="text-xs"
                                                                                >
                                                                                    <Folder className="mr-2 h-4 w-4" />{' '}
                                                                                    {target.title}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="px-2 py-2 text-xs text-muted-foreground">No topics</div>
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
                        <span>Delete</span>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this package?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="text-sm text-muted-foreground">
                            This action can’t be undone. The package will be removed. Topics won’t be deleted unless
                            your parent logic performs that action.
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDelete(pendingDeleteId!)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {renaming && (
                <Dialog open onOpenChange={(o) => !o && setRenaming(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rename package</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground" htmlFor="pkg-rename">
                                Name
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
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleRename} disabled={!renaming.name.trim()}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default TreeView;
