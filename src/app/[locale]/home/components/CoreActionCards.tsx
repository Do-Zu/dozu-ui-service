import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Library, Sparkles, ArrowRight } from 'lucide-react';

interface CoreActionCardsProps {}

const CoreActionCards: React.FC<CoreActionCardsProps> = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-800">View Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Manage your learning timeline and track progress across all topics.
          </p>
        </CardContent>
      </Card>

      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
              <Library className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-800">Manage Library</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Organize your learning materials, flashcards, and study content.
          </p>
        </CardContent>
      </Card>

      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-800">Generate Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Create new learning materials with AI-powered content generation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoreActionCards;
