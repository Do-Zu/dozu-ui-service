'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentQuizProgress, QuestionPerformance } from '@/types/activity';

interface StudentResultsTabProps {
  students: StudentQuizProgress[];
  questions: QuestionPerformance[];
}

export default function StudentResultsTab({ students, questions }: StudentResultsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Detailed Student Results</CardTitle>
          <p className="text-sm text-gray-600">
            Individual student performance for each question
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Student</th>
                  <th className="text-center p-3 font-medium text-gray-900">% Correct</th>
                  <th className="text-center p-3 font-medium text-gray-900">Correct</th>
                  <th className="text-center p-3 font-medium text-gray-900">Total</th>
                  {questions.slice(0, 10).map((question, index) => (
                    <th key={question.questionId} className="text-center p-3 font-medium text-gray-900 text-xs">
                      Q{index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.studentId} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{student.studentName}</td>
                    <td className="p-3 text-center">{student.score}%</td>
                    <td className="p-3 text-center">{student.correctAnswers}</td>
                    <td className="p-3 text-center">{student.answers.length}</td>
                    {student.answers.slice(0, 10).map((answer, index) => (
                      <td key={index} className="p-3 text-center">
                        <Badge 
                          variant={answer.isCorrect ? "default" : "destructive"}
                          className={answer.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {answer.isCorrect ? '✓' : '✗'}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Average Row */}
                <tr className="border-t-2 bg-gray-50">
                  <td className="p-3 font-medium">Average</td>
                  <td className="p-3 text-center font-medium">52%</td>
                  <td className="p-3 text-center font-medium">10</td>
                  <td className="p-3 text-center font-medium">20</td>
                  {Array(10).fill('').map((_, index) => (
                    <td key={index} className="p-3 text-center">
                      <span className="text-gray-500">-</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Question Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.slice(0, 10).map((question, index) => (
              <div key={question.questionId} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    Q{index + 1}: {question.questionText}
                  </h4>
                  <Badge 
                    variant="outline"
                    className={
                      question.accuracyLevel === 'thuong_sai' ? 'border-red-200 text-red-700' :
                      question.accuracyLevel === 'doi_luc_sai' ? 'border-yellow-200 text-yellow-700' :
                      question.accuracyLevel === 'it_khi_sai' ? 'border-green-200 text-green-700' :
                      'border-gray-200 text-gray-700'
                    }
                  >
                    {question.accuracyPercentage}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{question.definition}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
