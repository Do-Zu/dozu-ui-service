'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentQuizProgress } from '@/types/activity';
import StudentProgressCard from './StudentProgressCard';

interface StudentSummaryTabProps {
  students: StudentQuizProgress[];
}

export default function StudentSummaryTab({ students }: StudentSummaryTabProps) {
  return (
    <div className="space-y-6">
      {/* Student List Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Student Summary</CardTitle>
          <p className="text-sm text-gray-600">
            Overview of all students and their quiz completion status
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>({students.length}) Student A-Z</span>
              <span>Status</span>
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
