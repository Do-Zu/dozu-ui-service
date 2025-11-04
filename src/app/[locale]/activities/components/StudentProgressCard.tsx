'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StudentQuizProgress } from '@/types/activity';

interface StudentProgressCardProps {
  student: StudentQuizProgress;
}

export default function StudentProgressCard({ student }: StudentProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      default:
        return 'Unknown';
    }
  };

  const completionPercentage = (student.correctAnswers / student.totalAnswers) * 100;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-500 text-white">
                {student.studentName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">{student.studentName}</h3>
              <p className="text-sm text-gray-500">
                {student.status === 'completed' ? 
                  `Completed on ${new Date(student.lastActivity).toLocaleDateString()}` : 
                  'Not completed yet'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(student.status)}>
              {getStatusText(student.status)}
            </Badge>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{student.correctAnswers}/{student.totalAnswers} questions</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">
              {student.correctAnswers} correct
            </span>
            <span className="text-red-600 font-medium">
              {student.wrongAnswers} incorrect
            </span>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Detailed Results</h4>
              <div className="space-y-2">
                {student.answers.map((answer, index) => (
                  <div key={answer.questionId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Q{index + 1}: {answer.questionText}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={answer.isCorrect ? "default" : "destructive"}
                        className={answer.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
