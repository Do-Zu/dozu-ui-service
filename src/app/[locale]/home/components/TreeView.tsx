'use client';

import React, { useState } from 'react';
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
import { TypographyP } from '@/components/ui/typography/TypographyP';

export interface ITreeTopicItem {
    topicId: number | string;
    name: string;
}

export interface ITreePackageItem {
    id: number | string;
    name: string;
    color?: string;
    topics: ITreeTopicItem[];
}

type CreatePackageHandler = (name: string) => void | Promise<void>;
type DeletePackageHandler = (id: string | number) => void | Promise<void>;
type SelectTopicHandler = (topic: ITreeTopicItem, pkg: ITreePackageItem) => void;
type RenamePackageHandler = (id: string | number, name: string) => void | Promise<void>;
type RemoveTopicHandler = (topicId: string | number, pkgId: string | number) => void | Promise<void>;
type MoveTopicHandler = (
    topicId: string | number,
    fromPkgId: string | number,
    toPkgId: string | number,
) => void | Promise<void>;

export interface TreeViewProps {
    packages?: ITreePackageItem[];
    onCreatePackage?: CreatePackageHandler;
    onDeletePackage?: DeletePackageHandler;
    onRenamePackage?: RenamePackageHandler;
    onRemoveTopic?: RemoveTopicHandler;
    onMoveTopic?: MoveTopicHandler;
    onSelectTopic?: SelectTopicHandler;
    className?: string;
    selectedTopicId?: string | number;
}
const samplePackages: ITreePackageItem[] = [
    {
        id: 1,
        name: 'P1',
        topics: [],
    },
    {
        id: 2,
        name: 'Package 2',
        topics: [
            {
                name: 'FUnction',
                topicId: 1,
            },
            {
                name: 'Material',
                topicId: 2,
            },
            {
                name: 'Helper',
                topicId: 3,
            },
            {
                name: 'Helper',
                topicId: 4,
            },
            {
                name: 'Helper',
                topicId: 5,
            },
            {
                name: 'Helper',
                topicId: 6,
            },
            {
                name: 'Helper',
                topicId: 7,
            },
            {
                name: 'Helper',
                topicId: 8,
            },
        ],
    },
];

const TreeView: React.FC<TreeViewProps> = ({
    packages = samplePackages,
    onCreatePackage,
    onDeletePackage,
    onSelectTopic,
    onRenamePackage,
    onRemoveTopic,
    onMoveTopic,
    className,
    selectedTopicId,
}) => {
    const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});
    const [creating, setCreating] = useState(false);
    const [newPackageName, setNewPackageName] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState<string | number | null>(null);
    const [pkgMenu, setPkgMenu] = useState<string | number | null>(null);
    const [topicMenu, setTopicMenu] = useState<{ pkgId: string | number; topicId: string | number } | null>(null);
    const [renaming, setRenaming] = useState<{ pkgId: string | number; name: string } | null>(null);

    const toggle = (id: string | number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const handleCreate = async () => {
        if (!newPackageName.trim()) return;
        if (!onCreatePackage) return;
        setCreating(true);
        try {
            await onCreatePackage(newPackageName.trim());
            setNewPackageName('');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!onDeletePackage) return;
        await onDeletePackage(id);
        setPendingDeleteId(null);
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
            <Dialog>
                <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="w-full justify-start gap-2">
                        <Plus className="h-4 w-4 rounded-full" />
                        <span className="text-xs">New package</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create package</DialogTitle>
                    </DialogHeader>
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
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCreate} disabled={creating || !newPackageName.trim()}>
                            {creating ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );

    return (
        <div className={cn('w-full text-sm', className)}>
            <div className="space-y-1">
                {packages?.map((pkg) => {
                    const isOpen = expanded[pkg.id] ?? true; // default open
                    const count = pkg.topics?.length ?? 0;
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
                                                style={{ backgroundColor: pkg.color || '#94a3b8' }}
                                            />

                                            {isOpen ? (
                                                <FolderOpen className="h-4 w-4 text-primary" />
                                            ) : (
                                                <Folder className="h-4 w-4 text-primary" />
                                            )}

                                            <span className="font-medium">{pkg.name}</span>
                                            <span className="ml-1 text-xs text-muted-foreground">{count}</span>
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
                                            setRenaming({ pkgId: pkg.id, name: pkg.name });
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
                                    {pkg.topics && pkg.topics.length > 0 ? (
                                        <ul className="py-1">
                                            {pkg.topics.map((t) => {
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
                                                                                    {target.name}
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
