'use client';

import React from 'react';
import { Sparkles, BookOpen, FileText, Lightbulb, Check, Gamepad2, Map } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setSelectedMethod } from '@/stores/features/import-dialog/importDialogSlice';

interface SelectMethodProps {}

const SelectMethod: React.FC<SelectMethodProps> = () => {
  const dispatch = useAppDispatch();
  const { suggestedMethods, selectedMethod } = useAppSelector((state) => state.importDialog);

  const handleMethodSelection = (method: string) => {
    dispatch(setSelectedMethod(method));
  };

  // Method icon mapping
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'flashcards':
        return <BookOpen className="h-5 w-5" />;
      case 'quiz':
        return <Lightbulb className="h-5 w-5" />;
      case 'gamification':
        return <Gamepad2 className="h-5 w-5" />;
      case 'mind map':
        return <Map className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Method description mapping
  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'flashcards':
        return 'Perfect for memorization and quick review';
      case 'quiz':
        return 'Great for testing your knowledge';
      case 'gamification':
        return 'Learn through interactive game-based activities';
      case 'mind map':
        return 'Visual organization to connect ideas and concepts';
      default:
        return 'Ideal for detailed study and reference';
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium mb-1">AI Content Analysis</h3>
            <p className="text-sm text-gray-600">
              We've analyzed your content and identified the following learning methods that would
              work best:
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {suggestedMethods.map((method) => (
          <div
            key={method}
            className={`p-4 rounded-lg border ${selectedMethod === method ? 'border-gray-800 bg-gray-50' : 'border-gray-200'} cursor-pointer transition-all`}
            onClick={() => handleMethodSelection(method)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMethodIcon(method)}
                <div>
                  <h4 className="font-medium capitalize">{method}</h4>
                  <p className="text-sm">{getMethodDescription(method)}</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border ${selectedMethod === method ? 'bg-gray-800 border-gray-800' : 'border-gray-300'} flex items-center justify-center`}
              >
                {selectedMethod === method && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectMethod;
