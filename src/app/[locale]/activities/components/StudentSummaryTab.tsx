'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentQuizProgress } from '@/types/activity';
import StudentProgressCard from './StudentProgressCard';

interface StudentSummaryTabProps {
  students: StudentQuizProgress[];
}

export default function StudentSummaryTab({ students }: StudentSummaryTabProps) {
  const t = useTranslations('activities');
  
  return (
    <div className="space-y-6">
      {/* Student List Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('studentSummary.title')}</CardTitle>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            {t('studentSummary.description')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-muted-foreground">
              <span>{t('studentSummary.studentCount', { count: students.length })}</span>
              <span>{t('studentSummary.status')}</span>
            </div>
          </div>
          
          {/* Student Progress Cards */}
          <div className="space-y-3">
            {students.map((student) => (
              <StudentProgressCard key={student.studentId} student={student} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
