import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, BookOpen, Edit, Trash2 } from 'lucide-react';

interface ContentCardProps {
  id?: string;
  title?: string;
  createdAt?: string;
  contentType?: 'flashcards' | 'notes' | 'quiz';
  itemCount?: number;
  lastStudied?: string;
  onStudy?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ContentCard = ({
  id = 'card-1',
  title = 'Introduction to React',
  createdAt = '2023-05-15',
  contentType = 'flashcards',
  itemCount = 24,
  lastStudied = '3 days ago',
  onStudy = () => {},
  onEdit = () => {},
  onDelete = () => {},
}: ContentCardProps) => {
  const formatDate = (dateString: string) => {
    if (dateString.includes('ago')) return dateString;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'flashcards':
        return 'Flashcard Set';
      case 'notes':
        return 'Notes';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Content';
    }
  };

  return (
    <Card className="w-[280px] h-[220px] overflow-hidden transition-all duration-200 hover:shadow-md bg-gray-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium text-gray-800 truncate">{title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStudy(id)}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Study</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(id)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(id)} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[100px] bg-gray-200 rounded-md mb-3 flex items-center justify-center">
          <div className="text-gray-500 text-sm">{getContentTypeLabel(contentType)} Preview</div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Created: {formatDate(createdAt)}</span>
          <span>{itemCount} items</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4 flex justify-between">
        <div className="text-xs text-gray-500">
          {lastStudied ? `Last studied: ${lastStudied}` : 'Not studied yet'}
        </div>
        <Button size="sm" onClick={() => onStudy(id)} className="bg-gray-700 hover:bg-gray-800">
          Study
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentCard;
