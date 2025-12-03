import { ActivityMonitorData, ActivityDetails, StudentQuizProgress, PerformanceBreakdown, QuestionPerformance } from '@/types/activity';
import { 
    IQuizClassResultsResponse,
    IQuestionAnalysisResponse 
} from '@/services/class-based-learning/quizClass.service';

/**
 * Convert backend quiz class results to UI activity monitor data format
 */
export function adaptQuizClassResultsToActivityMonitor(
    quizResults: IQuizClassResultsResponse,
    questionAnalysis?: IQuestionAnalysisResponse | null
): ActivityMonitorData {
    const { quizInfo, statistics, studentResults } = quizResults;

    // Adapt activity details
    const activity: ActivityDetails = {
        id: quizInfo.classQuizId.toString(),
        title: quizInfo.title,
        description: quizInfo.content || '',
        topicId: 0,
        topicName: '',
        classId: 0,
        dueDate: quizInfo.dueDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'active',
        totalStudents: statistics.totalStudents,
        completedStudents: statistics.completedCount,
        inProgressStudents: statistics.inProgressCount,
        notStartedStudents: statistics.notStartedCount,
        totalQuestions: 0,
        averageScore: 0,
        quizType: 'quiz',
    };

    // Calculate average score from completed students
    const completedStudents = studentResults.filter(s => s.status === 'completed');
    if (completedStudents.length > 0) {
        const totalScore = completedStudents.reduce((sum, s) => sum + (s.correctPercentage || 0), 0);
        activity.averageScore = Math.round(totalScore / completedStudents.length);
    }

    // Calculate total questions (use max from student results)
    const maxQuestions = studentResults.reduce((max, s) => {
        return Math.max(max, s.questionsCount || 0);
    }, 0);
    activity.totalQuestions = maxQuestions;

    // Adapt student results
    // Both APIs now return 1-based questionIndex (snapshotQuestionIdx), so no conversion needed
    const students: StudentQuizProgress[] = studentResults.map((result) => {
        const incorrectCount = (result.questionsCount || 0) - (result.correctCount || 0);
        
        // Map answers if available - questionIndex is already 1-based from API
        const answers = result.answers?.map(answer => {
            // answer.questionIndex is already 1-based (snapshotQuestionIdx: 1, 2, 3...)
            return {
                questionId: answer.questionIndex.toString(),
                questionText: `Question ${answer.questionIndex}`,
                selectedAnswer: answer.userAnswerIndex,
                correctAnswer: null, // Would need question data to get correct answer
                isCorrect: answer.isCorrect,
                answeredAt: answer.answeredAt || new Date().toISOString(),
            };
        }) || [];
        
        return {
            studentId: result.userId.toString(),
            studentName: result.fullName || result.username,
            status: mapStatus(result.status),
            correctAnswers: result.correctCount || 0,
            wrongAnswers: incorrectCount,
            skippedAnswers: (result.questionsCount || 0) - (result.answers?.length || 0),
            totalAnswers: result.questionsCount || 0,
            accuracy: result.correctPercentage || 0,
            timeSpent: 0,
            lastActivity: result.completedAt || new Date().toISOString(),
            score: result.correctPercentage || 0,
            answers,
        };
    });

    // Calculate performance breakdown
    // Use question analysis data if available, otherwise calculate from students
    let performance: PerformanceBreakdown;
    let questions: QuestionPerformance[] = [];

    if (questionAnalysis) {
        // Use question analysis data for accurate performance breakdown
        const { summary, questions: analysisQuestions, totalStudents: analysisTotalStudents } = questionAnalysis;
        
        performance = {
            excellent: students.filter(s => s.status === 'completed' && s.accuracy > 80).length,
            good: students.filter(s => s.status === 'completed' && s.accuracy >= 60 && s.accuracy <= 80).length,
            average: students.filter(s => s.status === 'completed' && s.accuracy >= 40 && s.accuracy < 60).length,
            poor: students.filter(s => s.status === 'completed' && s.accuracy < 40).length,
            notStarted: statistics.notStartedCount,
            totalTerms: analysisQuestions.length || maxQuestions,
            thuongSai: summary.thuongSai,
            doiLucSai: summary.doiLucSai,
            itKhiSai: summary.itKhiSai,
            chuaBatDau: summary.chuaBatDau,
        };

        // Map question analysis to QuestionPerformance format
        // questionIndex from API is already 1-based (after fix in service)
        questions = analysisQuestions.map(q => {
            // Get the correct answer text if choices are available
            const correctAnswer = q.choices && q.correctIndex !== undefined && q.choices[q.correctIndex] 
                ? q.choices[q.correctIndex] 
                : '';
            
            // questionIndex is already 1-based from API (1, 2, 3...)
            return {
                questionId: q.questionIndex.toString(), // Already 1-based, use as-is
                questionText: q.questionText || `Question ${q.questionIndex}`,
                choices: q.choices,
                correctIndex: q.correctIndex,
                correctAnswers: q.correctCount,
                wrongAnswers: q.totalAnswered - q.correctCount,
                skippedAnswers: q.totalStudents - q.totalAnswered,
                averageTime: 0, // Not available from API
                difficulty: q.category === 'thuong_sai' ? 'hard' : 
                           q.category === 'doi_luc_sai' ? 'medium' : 'easy',
                accuracyLevel: q.category,
                accuracyPercentage: q.correctRate * 100,
                definition: correctAnswer, // Use correct answer as definition
            };
        });
    } else {
        // Fallback: calculate from student data if question analysis not available
        performance = {
            excellent: students.filter(s => s.status === 'completed' && s.accuracy > 80).length,
            good: students.filter(s => s.status === 'completed' && s.accuracy >= 60 && s.accuracy <= 80).length,
            average: students.filter(s => s.status === 'completed' && s.accuracy >= 40 && s.accuracy < 60).length,
            poor: students.filter(s => s.status === 'completed' && s.accuracy < 40).length,
            notStarted: statistics.notStartedCount,
            totalTerms: maxQuestions,
            thuongSai: 0,
            doiLucSai: 0,
            itKhiSai: 0,
            chuaBatDau: statistics.notStartedCount,
        };

        // No questions if question analysis not available
        questions = [];
    }

    return {
        activity,
        students,
        performance,
        questions,
    };
}

/**
 * Map backend status to UI status format
 */
function mapStatus(status: 'completed' | 'in_progress' | 'not_started'): 'completed' | 'in-progress' | 'not-started' {
    switch (status) {
        case 'completed':
            return 'completed';
        case 'in_progress':
            return 'in-progress';
        case 'not_started':
            return 'not-started';
        default:
            return 'not-started';
    }
}

