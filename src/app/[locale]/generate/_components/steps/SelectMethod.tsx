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
          <div className="bg-primary p-2 rounded-full">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium mb-1">AI Content Analysis</h3>
            <p className="text-sm text-muted-foreground">
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
            className={`p-4 rounded-lg border ${selectedMethod === method ? 'border-border bg-muted' : 'border-border'} cursor-pointer transition-all`}
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
                className={`w-5 h-5 rounded-full border ${selectedMethod === method ? 'bg-muted border-border' : 'border-border'} flex items-center justify-center`}
              >
                {selectedMethod === method && <Check className="h-3 w-3 text-foreground" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectMethod;
