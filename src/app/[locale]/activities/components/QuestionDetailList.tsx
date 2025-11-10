'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { QuestionPerformance } from '@/types/activity';

interface QuestionDetailListProps {
  questions: QuestionPerformance[];
}

export default function QuestionDetailList({ questions }: QuestionDetailListProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    thuong_sai: true,
    doi_luc_sai: true,
    it_khi_sai: true,
    chua_bat_dau: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSectionConfig = (level: string) => {
    switch (level) {
      case 'thuong_sai':
        return {
          name: 'Thường sai',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'doi_luc_sai':
        return {
          name: 'Đôi lúc sai',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'it_khi_sai':
        return {
          name: 'Ít khi sai',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'chua_bat_dau':
        return {
          name: 'Chưa bắt đầu',
          color: 'bg-gray-400',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          name: 'Unknown',
          color: 'bg-gray-400',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getDescription = (level: string) => {
    switch (level) {
      case 'thuong_sai':
        return 'Students have a 0%-25% correct answer rate for these terms.';
      case 'doi_luc_sai':
        return 'Students have a 25%-75% correct answer rate for these terms.';
      case 'it_khi_sai':
        return 'Students have a 75%-100% correct answer rate for these terms.';
      case 'chua_bat_dau':
        return 'Students have not learned these terms yet.';
      default:
        return '';
    }
  };

  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.accuracyLevel]) {
      acc[question.accuracyLevel] = [];
    }
    acc[question.accuracyLevel].push(question);
    return acc;
  }, {} as Record<string, QuestionPerformance[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedQuestions).map(([level, levelQuestions]) => {
        const config = getSectionConfig(level);
        const isExpanded = expandedSections[level];
        
        return (
          <Card key={level} className={`${config.bgColor} ${config.borderColor} border-l-4`}>
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(level)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={`${config.bgColor} ${config.textColor} border-0`}>
                    {levelQuestions.length}
                  </Badge>
                  <h3 className="font-semibold text-gray-900">
                    {levelQuestions.length} {config.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {isExpanded ? 'Hide' : 'Show'} details
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{getDescription(level)}</p>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {levelQuestions.map((question) => (
                    <div 
                      key={question.questionId} 
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      <div className="grid grid-cols-12 gap-4 items-start">
                        <div className="col-span-1">
                          <div className={`w-12 h-8 rounded flex items-center justify-center text-white font-semibold text-sm ${config.color}`}>
                            {Number(question.accuracyPercentage).toFixed(1)}%
                          </div>
                        </div>
                        <div className="col-span-5">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {question.questionText}
                          </h4>
                        </div>
                        <div className="col-span-6">
                          <p className="text-sm text-gray-600">
                            {question.definition}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
