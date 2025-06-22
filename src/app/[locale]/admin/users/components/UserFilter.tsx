'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface UserFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function UserFilter({ onFilterChange }: UserFilterProps) {
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

const handleApply = () => {
  const filters = {
    ...(role !== 'all' && role !== '' ? { role } : {}),
    ...(status === 'active' ? { isActive: 'true' } : {}),
    ...(status === 'inactive' ? { isActive: 'false' } : {}),
  };

  onFilterChange(filters);
};

  const handleReset = () => {
    setRole('');
    setStatus('');
    onFilterChange({});
  };

  return (
    <div className="flex items-end gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleApply}>Filter</Button>
      <Button variant="outline" onClick={handleReset}>Reset</Button>
    </div>
  );
}
