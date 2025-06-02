'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Library, Sparkles, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

interface CoreActionCardsProps {}

interface ActionCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
}

const CoreActionCards: React.FC<CoreActionCardsProps> = () => {
  const router = useRouter();

  const handleRedirectGenerate = () => {
    router.push(ROUTES.GENERATE);
  };

  const actionCards: ActionCard[] = useMemo(
    () => [
      {
        id: 'schedule',
        title: 'View Schedule',
        description: 'Manage your learning timeline and track progress across all topics.',
        icon: Calendar,
      },
      {
        id: 'library',
        title: 'Manage Library',
        description: 'Organize your learning materials, flashcards, and study content.',
        icon: Library,
      },
      {
        id: 'generate',
        title: 'Generate Content',
        description: 'Create new learning materials with AI-powered content generation.',
        icon: Sparkles,
        onClick: handleRedirectGenerate,
      },
    ],
    [],
  );

  return (
    <div className="max-w-[60%] mx-auto my-4 grid grid-cols-1 md:grid-cols-3 gap-10">
      {actionCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={card.id}
            onClick={card.onClick}
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-sm font-semibold text-gray-800">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-xs">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CoreActionCards;
