'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest } from '@/api/api';
import { ApiResponse } from '@/api/type';
import { UserBasic } from '@/types/user';
import { getUserColumns } from './components/Columns';
import { DataTable } from '@/components/ui/data-table';
import { UserFilter } from './components/UserFilter';

function AdminUsersPage() {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [users, setUsers] = useState<UserBasic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(
        async (params = filters) => {
            try {
                setLoading(true);
                setError(null);

                const query = new URLSearchParams(params).toString();
                const url = query ? `/admin/users?${query}` : `/admin/users`;

                const response: ApiResponse<UserBasic[]> = await getRequest<unknown, UserBasic[]>(url);
                const mapped = (response.data ?? []).map(
                    (user: any): UserBasic => ({
                        id: String(user.userId),
                        name: user.fullName || '—',
                        email: user.email,
                        role: user.role,
                        isActive: user.isActive,
                        createdAt: user.createdAt,
                    }),
                );
                setUsers(mapped);
            } catch (err: any) {
                setError(err.message || 'An error occurred while retrieving the user list.');
            } finally {
                setLoading(false);
            }
        },
        [filters],
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFilterChange = (newFilters: Record<string, string>) => {
        setFilters(newFilters);
        fetchUsers(newFilters); 
    };

    const tableTitle = useMemo(() => `User List (${users.length})`, [users]);

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            </div>

            <UserFilter onFilterChange={handleFilterChange} />

            <DataTable
                columns={getUserColumns(fetchUsers)}
                data={users}
                loading={loading}
                error={error}
                title={tableTitle}
            />
        </div>
    );
}

export default withAuth(AdminUsersPage, {
    requiredRole: 'admin',
});
