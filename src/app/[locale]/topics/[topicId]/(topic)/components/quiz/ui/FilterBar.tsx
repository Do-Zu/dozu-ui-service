'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  scoreFilter: 'all' | 'high' | 'med' | 'low';
  setScoreFilter: (v: 'all' | 'high' | 'med' | 'low') => void;
  sortDate: 'newest' | 'oldest';
  setSortDate: (v: 'newest' | 'oldest') => void;
}

export default function FilterBar({
  search,
  setSearch,
  scoreFilter,
  setScoreFilter,
  sortDate,
  setSortDate,
}: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-3 items-center">

      {/* search */}
      <div className="relative w-full sm:w-1/2 md:w-1/3">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-3"
        />
      </div>

      {/* score filter */}
      <div className="w-36">
        <Select value={scoreFilter} onValueChange={(v) => setScoreFilter(v as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scores</SelectItem>
            <SelectItem value="high">High (90%+)</SelectItem>
            <SelectItem value="med">Medium (70–89)</SelectItem>
            <SelectItem value="low">Low (&lt;70)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* sort date */}
      <div className="w-32">
        <Select value={sortDate} onValueChange={(v) => setSortDate(v as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}
