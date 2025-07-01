'use client';

import { ColumnDef } from '@tanstack/react-table';
import { UserBasic } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { LinkIcon } from 'lucide-react';
import { updateUserRoleSchema } from '@/lib/schemas/user.schema';

function RoleBadge({ role }: { role: UserBasic['role'] }) {
    return <Badge variant="outline">{role}</Badge>;
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
    return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
}

function ActionButtons({ user, refetch }: { user: UserBasic; refetch: () => void }) {
    const { execute: toggleActive, loading: toggleLoading } = usePost(
        `/admin/users/${user.id}/toggle-active`,
        'PATCH',
        undefined,
        undefined,
        undefined,
        () => toast({ description: 'Failed to toggle active', variant: 'destructive' }),
        refetch,
    );

    const { execute: updateRole, loading: roleLoading } = usePost(
        `/admin/users/${user.id}/role`,
        'PATCH',
        updateUserRoleSchema,
        undefined,
        undefined,
        () => toast({ description: 'Failed to change role', variant: 'destructive' }),
        refetch,
    );

    const handleToggleActive = async () => {
        const res = (await toggleActive({})) as { message?: string };
        if (res?.message) toast({ description: res.message, variant: 'default' });
    };
    const handleToggleRole = async () => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const res = (await updateRole({ role: newRole })) as { message?: string };
        if (res?.message) {
            toast({ description: res.message });
        }
    };

    return (
        <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleToggleRole} disabled={roleLoading}>
                {user.role === 'admin' ? 'Demote' : 'Promote'}
            </Button>
            <Button
                variant={user.isActive ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggleActive}
                disabled={toggleLoading}
            >
                {user.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Link
                href={`/admin/users/${user.id}/oauth`}
                className="text-muted-foreground hover:text-primary"
                title="Xem tài khoản OAuth"
            >
                <LinkIcon size={16} />
            </Link>
        </div>
    );
}

export const getUserColumns = (refetch: () => void): ColumnDef<UserBasic>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => row.original.name || '—',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => <ActiveBadge isActive={row.original.isActive} />,
    },
    {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => <ActionButtons user={row.original} refetch={refetch} />,
    },
];
