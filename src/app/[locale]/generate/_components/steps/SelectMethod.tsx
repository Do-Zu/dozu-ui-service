'use client';

import React from 'react';
import { Sparkles, BookOpen, FileText, Lightbulb, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setSelectedMethod } from '@/stores/features/import-dialog/importDialogSlice';

interface SelectMethodProps {}

const SelectMethod: React.FC<SelectMethodProps> = () => {
  const dispatch = useAppDispatch();
  const { suggestedMethods, selectedMethod } = useAppSelector((state) => state.importDialog);

  const handleMethodSelection = (method: string) => {
    dispatch(setSelectedMethod(method));
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
                {method === 'flashcards' && <BookOpen className="h-5 w-5" />}
                {method === 'notes' && <FileText className="h-5 w-5" />}
                {method === 'quiz' && <Lightbulb className="h-5 w-5" />}
                <div>
                  <h4 className="font-medium capitalize">{method}</h4>
                  <p className="text-sm">
                    {method === 'flashcards' && 'Perfect for memorization and quick review'}
                    {method === 'notes' && 'Ideal for detailed study and reference'}
                    {method === 'quiz' && 'Great for testing your knowledge'}
                  </p>
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
