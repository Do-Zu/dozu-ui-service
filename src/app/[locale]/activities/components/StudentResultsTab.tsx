'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentQuizProgress, QuestionPerformance } from '@/types/activity';

interface StudentResultsTabProps {
  students: StudentQuizProgress[];
  questions: QuestionPerformance[];
}

export default function StudentResultsTab({ students, questions }: StudentResultsTabProps) {
  const t = useTranslations('activities');
  
  // Calculate averages from all students with answers (including in-progress)
  // This allows teacher to see real-time progress, not just completed students
  const studentsWithAnswers = students.filter(s => s.answers && s.answers.length > 0);
  const completedStudents = students.filter(s => s.status === 'completed');
  
  // Calculate average score from all students with answers (use accuracy if score not available)
  const averageScore = studentsWithAnswers.length > 0
    ? studentsWithAnswers.reduce((sum, s) => {
        // Use score if available, otherwise use accuracy (for in-progress students)
        const studentScore = s.score !== null && s.score !== undefined ? s.score : (s.accuracy || 0);
        return sum + studentScore;
      }, 0) / studentsWithAnswers.length
    : 0;
  
  // Calculate average correct answers from all students with answers
  const averageCorrect = studentsWithAnswers.length > 0
    ? Math.round(studentsWithAnswers.reduce((sum, s) => sum + s.correctAnswers, 0) / studentsWithAnswers.length)
    : 0;
  
  // Calculate average total answers from all students with answers
  const averageTotal = studentsWithAnswers.length > 0
    ? Math.round(studentsWithAnswers.reduce((sum, s) => sum + (s.answers?.length || 0), 0) / studentsWithAnswers.length)
    : 0;

  // Calculate average correct answers for each question from all students with answers
  const averageQuestionAnswers = questions.map((question) => {
    const questionId = question.questionId;
    const questionAnswers = studentsWithAnswers.map(s => {
      const answer = s.answers?.find(a => a.questionId === questionId);
      return answer?.isCorrect ? 1 : 0;
    });
    if (questionAnswers.length === 0) return '-';
    const correctCount = questionAnswers.reduce((sum: number, val) => sum + val, 0);
    const percentage = (correctCount / questionAnswers.length) * 100;
    return percentage.toFixed(0) + '%';
  });

  // Refs for syncing row heights
  const fixedHeaderRef = useRef<HTMLTableRowElement>(null);
  const scrollableHeaderRef = useRef<HTMLTableRowElement>(null);
  const fixedRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const scrollableRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const fixedAverageRef = useRef<HTMLTableRowElement>(null);
  const scrollableAverageRef = useRef<HTMLTableRowElement>(null);

  // Sync row heights
  useEffect(() => {
    const syncHeights = () => {
      // Sync header row
      if (fixedHeaderRef.current && scrollableHeaderRef.current) {
        // Reset heights first to get natural heights
        fixedHeaderRef.current.style.height = 'auto';
        scrollableHeaderRef.current.style.height = 'auto';
        
        // Get the natural heights
        const fixedHeight = fixedHeaderRef.current.offsetHeight;
        const scrollableHeight = scrollableHeaderRef.current.offsetHeight;
        const maxHeight = Math.max(fixedHeight, scrollableHeight);
        
        // Set both to max height
        fixedHeaderRef.current.style.height = `${maxHeight}px`;
        scrollableHeaderRef.current.style.height = `${maxHeight}px`;
      }

      // Sync student rows
      students.forEach((_, index) => {
        const fixedRow = fixedRowRefs.current[index];
        const scrollableRow = scrollableRowRefs.current[index];
        if (fixedRow && scrollableRow) {
          // Reset heights first
          fixedRow.style.height = 'auto';
          scrollableRow.style.height = 'auto';
          
          // Get natural heights
          const fixedHeight = fixedRow.offsetHeight;
          const scrollableHeight = scrollableRow.offsetHeight;
          const maxHeight = Math.max(fixedHeight, scrollableHeight);
          
          // Set both to max height
          fixedRow.style.height = `${maxHeight}px`;
          scrollableRow.style.height = `${maxHeight}px`;
        }
      });

      // Sync average row
      if (fixedAverageRef.current && scrollableAverageRef.current) {
        // Reset heights first
        fixedAverageRef.current.style.height = 'auto';
        scrollableAverageRef.current.style.height = 'auto';
        
        // Get natural heights
        const fixedHeight = fixedAverageRef.current.offsetHeight;
        const scrollableHeight = scrollableAverageRef.current.offsetHeight;
        const maxHeight = Math.max(fixedHeight, scrollableHeight);
        
        // Set both to max height
        fixedAverageRef.current.style.height = `${maxHeight}px`;
        scrollableAverageRef.current.style.height = `${maxHeight}px`;
      }
    };

    // Sync after render with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(syncHeights, 100);
    window.addEventListener('resize', syncHeights);

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(syncHeights, 0);
    });
    const container = document.querySelector('[data-table-container]');
    if (container) {
      observer.observe(container, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', syncHeights);
      observer.disconnect();
    };
  }, [students, questions]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('studentResults.title')}</CardTitle>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            {t('studentResults.description')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex border border-gray-200 dark:border-border rounded-lg overflow-hidden" data-table-container>
            {/* Fixed columns */}
            <div className="flex-shrink-0 border-r border-gray-200 dark:border-border">
              <table className="border-collapse w-full">
                <thead>
                  <tr ref={fixedHeaderRef} className="border-b border-gray-200 dark:border-border">
                    <th className="text-left p-3 font-medium text-gray-900 dark:text-foreground min-w-[200px] w-[200px] bg-blue-100 dark:bg-muted">{t('studentResults.student')}</th>
                    <th className="text-center p-3 font-medium text-gray-900 dark:text-foreground min-w-[80px] w-[80px] bg-purple-100 dark:bg-muted">{t('studentResults.percentCorrect')}</th>
                    <th className="text-center p-3 font-medium text-gray-900 dark:text-foreground min-w-[70px] w-[70px] bg-green-100 dark:bg-muted">{t('studentResults.correct')}</th>
                    <th className="text-center p-3 font-medium text-gray-900 dark:text-foreground min-w-[60px] w-[60px] bg-orange-100 dark:bg-muted">{t('studentResults.total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr 
                      key={student.studentId} 
                      ref={(el) => { fixedRowRefs.current[index] = el; }}
                      className={`border-b border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50 ${index % 2 === 0 ? 'bg-white dark:bg-background' : 'bg-gray-50/30 dark:bg-muted/30'}`}
                    >
                      <td className="p-3 font-medium bg-blue-50/30 dark:bg-transparent text-gray-900 dark:text-foreground">{student.studentName}</td>
                      <td className="p-3 text-center bg-purple-50/30 dark:bg-transparent text-gray-900 dark:text-foreground">
                        {(() => {
                          // Calculate percentage from answers in realtime
                          // If student has answers, calculate accuracy from answers array
                          if (student.answers && student.answers.length > 0) {
                            // If student is completed, use score; otherwise calculate from answers
                            if (student.status === 'completed' && student.score !== null && student.score !== undefined) {
                              return Number(student.score).toFixed(0) + '%';
                            } else {
                              // Calculate accuracy from answers array for realtime updates
                              const correctCount = student.answers.filter(a => a.isCorrect === true).length;
                              const totalCount = student.answers.length;
                              const calculatedAccuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
                              return Number(calculatedAccuracy).toFixed(0) + '%';
                            }
                          }
                          return '-';
                        })()}
                      </td>
                      <td className="p-3 text-center bg-green-50/30 dark:bg-transparent text-gray-900 dark:text-foreground">{student.correctAnswers}</td>
                      <td className="p-3 text-center bg-orange-50/30 dark:bg-transparent text-gray-900 dark:text-foreground">{student.answers.length}</td>
                    </tr>
                  ))}
                  {/* Average Row - Always show to track real-time progress */}
                  <tr 
                    ref={fixedAverageRef}
                    className="border-t-2 border-gray-300 dark:border-border bg-gradient-to-r from-gray-100 to-gray-50 dark:from-muted dark:to-muted/80"
                  >
                    <td className="p-3 font-medium bg-blue-50/40 dark:bg-transparent text-gray-900 dark:text-foreground">{t('studentResults.average')}</td>
                    <td className="p-3 text-center font-medium bg-purple-50/40 dark:bg-transparent text-gray-900 dark:text-foreground">
                      {studentsWithAnswers.length > 0 ? averageScore.toFixed(0) + '%' : '-'}
                    </td>
                    <td className="p-3 text-center font-medium bg-green-50/40 dark:bg-transparent text-gray-900 dark:text-foreground">
                      {studentsWithAnswers.length > 0 ? averageCorrect : '-'}
                    </td>
                    <td className="p-3 text-center font-medium bg-orange-50/40 dark:bg-transparent text-gray-900 dark:text-foreground">
                      {studentsWithAnswers.length > 0 ? averageTotal : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Scrollable question columns */}
            <div className="flex-1 overflow-x-auto">
              <table className="border-collapse">
                <thead>
                  <tr ref={scrollableHeaderRef} className="border-b border-gray-200 dark:border-border">
                    {questions.map((question, index) => (
                      <th 
                        key={question.questionId} 
                        className="text-center p-3 font-medium text-gray-900 dark:text-foreground text-xs whitespace-nowrap border-r border-gray-200 dark:border-border last:border-r-0 bg-blue-100 dark:bg-muted"
                      >
                        Q{index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr 
                      key={student.studentId} 
                      ref={(el) => { scrollableRowRefs.current[index] = el; }}
                      className={`border-b border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50 ${index % 2 === 0 ? 'bg-white dark:bg-background' : 'bg-gray-50/30 dark:bg-muted/30'}`}
                    >
                      {questions.map((question, qIndex) => {
                        const answer = student.answers?.find(a => a.questionId === question.questionId);
                        return (
                          <td key={qIndex} className="p-3 text-center whitespace-nowrap border-r border-gray-200 dark:border-border last:border-r-0 bg-blue-50/20 dark:bg-transparent">
                            {answer ? (
                              <Badge 
                                variant={answer.isCorrect ? "default" : "destructive"}
                                className={answer.isCorrect ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-destructive/20 dark:text-destructive"}
                              >
                                {answer.isCorrect ? '✓' : '✗'}
                              </Badge>
                            ) : (
                              <span className="text-gray-300 dark:text-muted-foreground">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Average Row - Always show to track real-time progress */}
                  <tr 
                    ref={scrollableAverageRef}
                    className="border-t-2 border-gray-300 dark:border-border bg-gradient-to-r from-gray-100 to-gray-50 dark:from-muted dark:to-muted/80"
                  >
                    {averageQuestionAnswers.map((avg, index) => (
                      <td key={index} className="p-3 text-center border-r border-gray-200 dark:border-border last:border-r-0 bg-blue-50/30 dark:bg-transparent">
                        <span className="text-gray-700 dark:text-foreground font-medium">{avg}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('studentResults.questionDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.questionId} className="p-4 border border-gray-200 dark:border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-foreground">
                    Q{index + 1}: {question.questionText}
                  </h4>
                  <Badge 
                    variant="outline"
                    className={
                      question.accuracyLevel === 'thuong_sai' ? 'border-red-200 dark:border-destructive/50 text-red-700 dark:text-destructive' :
                      question.accuracyLevel === 'doi_luc_sai' ? 'border-yellow-200 dark:border-yellow-500/50 text-yellow-700 dark:text-yellow-400' :
                      question.accuracyLevel === 'it_khi_sai' ? 'border-green-200 dark:border-green-500/50 text-green-700 dark:text-green-400' :
                      'border-gray-200 dark:border-border text-gray-700 dark:text-muted-foreground'
                    }
                  >
                    {Number(question.accuracyPercentage).toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">{question.definition}</p>
              </div>
            ))} 
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
