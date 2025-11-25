'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { QuestionPerformance } from '@/types/activity';

interface QuestionDetailListProps {
  questions: QuestionPerformance[];
}

export default function QuestionDetailList({ questions }: QuestionDetailListProps) {
  const t = useTranslations('activities');
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
          name: t('termProgress.thuongSai'),
          color: 'bg-red-500 dark:bg-destructive',
          textColor: 'text-red-700 dark:text-destructive',
          bgColor: 'bg-red-50 dark:bg-destructive/10',
          borderColor: 'border-red-200 dark:border-destructive/50'
        };
      case 'doi_luc_sai':
        return {
          name: t('termProgress.doiLucSai'),
          color: 'bg-yellow-500 dark:bg-yellow-600',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          bgColor: 'bg-yellow-50 dark:bg-yellow-500/20',
          borderColor: 'border-yellow-200 dark:border-yellow-500/50'
        };
      case 'it_khi_sai':
        return {
          name: t('termProgress.itKhiSai'),
          color: 'bg-green-500 dark:bg-green-600',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-50 dark:bg-green-500/20',
          borderColor: 'border-green-200 dark:border-green-500/50'
        };
      case 'chua_bat_dau':
        return {
          name: t('termProgress.chuaBatDau'),
          color: 'bg-gray-400 dark:bg-muted-foreground',
          textColor: 'text-gray-700 dark:text-muted-foreground',
          bgColor: 'bg-gray-50 dark:bg-muted',
          borderColor: 'border-gray-200 dark:border-border'
        };
      default:
        return {
          name: t('common.unknown'),
          color: 'bg-gray-400 dark:bg-muted-foreground',
          textColor: 'text-gray-700 dark:text-muted-foreground',
          bgColor: 'bg-gray-50 dark:bg-muted',
          borderColor: 'border-gray-200 dark:border-border'
        };
    }
  };

  const getDescription = (level: string) => {
    switch (level) {
      case 'thuong_sai':
        return t('termProgress.thuongSaiDesc');
      case 'doi_luc_sai':
        return t('termProgress.doiLucSaiDesc');
      case 'it_khi_sai':
        return t('termProgress.itKhiSaiDesc');
      case 'chua_bat_dau':
        return t('termProgress.chuaBatDauDesc');
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
              className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection(level)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={`${config.bgColor} ${config.textColor} border-0`}>
                    {levelQuestions.length}
                  </Badge>
                  <h3 className="font-semibold text-gray-900 dark:text-foreground">
                   {config.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-muted-foreground">
                    {isExpanded ? t('termProgress.hideDetails') : t('termProgress.showDetails')}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">{getDescription(level)}</p>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {levelQuestions.map((question) => (
                    <div 
                      key={question.questionId} 
                      className="bg-white dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-border"
                    >
                      <div className="grid grid-cols-12 gap-4 items-start">
                        <div className="col-span-1">
                          <div className={`w-12 h-8 rounded flex items-center justify-center text-white font-semibold text-sm ${config.color}`}>
                            {Number(question.accuracyPercentage).toFixed(0)}%
                          </div>
                        </div>
                        <div className="col-span-5">
                          <h4 className="font-medium text-gray-900 dark:text-foreground text-sm">
                            {question.questionText}
                          </h4>
                        </div>
                        <div className="col-span-6">
                          <p className="text-sm text-gray-600 dark:text-muted-foreground">
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
