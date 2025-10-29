import { ActivityMonitorData, StudentQuizProgress, QuestionPerformance, PerformanceBreakdown, ActivityDetails } from '@/types/activity';

export const generateMockActivityData = (): ActivityMonitorData => {
  const questions: QuestionPerformance[] = [
    // Thường sai (0-25%) - 1 question (5%)
    {
      questionId: '1',
      questionText: 'pleural effusion',
      definition: 'fluid in the pleural space',
      accuracyPercentage: 22,
      accuracyLevel: 'thuong_sai',
      correctAnswers: 0,
      wrongAnswers: 1,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    
    // Đôi lúc sai (25-75%) - 10 questions (50%)
    {
      questionId: '2',
      questionText: 'systemic circulation',
      definition: 'blood looses oxygen to cells',
      accuracyPercentage: 40,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 0,
      wrongAnswers: 1,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '3',
      questionText: 'thoracentesis',
      definition: 'surgical puncture to remove fluid from the pleural space',
      accuracyPercentage: 50,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '4',
      questionText: 'auscultation',
      definition: 'listening to sounds',
      accuracyPercentage: 33,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 0,
      wrongAnswers: 1,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '5',
      questionText: 'oxygenated blood',
      definition: 'blood that carries an abundant amount of oxygen',
      accuracyPercentage: 67,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '6',
      questionText: 'pulmonary artery',
      definition: 'carries deoxygentated blood from the heart to the lungs',
      accuracyPercentage: 33,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 0,
      wrongAnswers: 1,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '7',
      questionText: 'atelectasis',
      definition: 'collapsed lung',
      accuracyPercentage: 33,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 0,
      wrongAnswers: 1,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '8',
      questionText: 'pulmonary circulation',
      definition: 'oxygen loses Co2',
      accuracyPercentage: 33,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 0,
      wrongAnswers: 1,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '9',
      questionText: 'the mitral valve is between',
      definition: 'left atrium and left ventricle',
      accuracyPercentage: 29,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 0,
      wrongAnswers: 1,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '10',
      questionText: 'flutter',
      definition: 'rapid but regular contractions, usually of the atria',
      accuracyPercentage: 50,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '11',
      questionText: 'fibrillation',
      definition: 'chaotic, irregular contractions of the heart, as in atrial or ventricular fibrillation',
      accuracyPercentage: 67,
      accuracyLevel: 'doi_luc_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    
    // Ít khi sai (75-100%) - 9 questions (45%)
    {
      questionId: '12',
      questionText: 'v fib vs a fib',
      definition: 'v fib is very bad a fib is most common',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '13',
      questionText: 'systole',
      definition: 'contraction',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '14',
      questionText: 'intubation',
      definition: 'insertion of a tube into the trachea',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '15',
      questionText: 'coronary artery disease',
      definition: 'disease of the arteries surrounding the heart (caused by atherosclerosis, yellow plaque)',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '16',
      questionText: 'Disstole',
      definition: 'relax',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '17',
      questionText: 'sa node is',
      definition: 'pacemaker of the heart',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '18',
      questionText: 'the tricuspid is the',
      definition: 'right atrium',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '19',
      questionText: 'a, an',
      definition: 'no, not, without',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    },
    {
      questionId: '20',
      questionText: 'tracheostomy',
      definition: 'surgical opening into the trachea',
      accuracyPercentage: 100,
      accuracyLevel: 'it_khi_sai',
      correctAnswers: 1,
      wrongAnswers: 0,
      skippedAnswers: 0,
      averageTime: 30,
      difficulty: 'medium'
    }
  ];

  const performance: PerformanceBreakdown = {
    totalTerms: 20,
    thuongSai: 1, // 5% (1/20)
    doiLucSai: 10, // 50% (10/20)
    itKhiSai: 9, // 45% (9/20)
    chuaBatDau: 0, // 0% (0/20)
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0,
    notStarted: 0
  };

  const students: StudentQuizProgress[] = [
    {
      studentId: '1',
      studentName: 'Mai Thi Hoàng Vy',
      status: 'completed',
      lastActivity: '2025-10-19T23:45:00Z',
      score: 52, // Match the Excel data
      correctAnswers: 10, // Match the Excel data (52% of 20 = ~10)
      wrongAnswers: 10,
      skippedAnswers: 0,
      totalAnswers: 20,
      accuracy: 52,
      timeSpent: 16,
      answers: questions.map((q, index) => {
        const correctAnswer = Math.floor(Math.random() * 4); // Random correct answer index
        const isCorrect = q.accuracyLevel === 'it_khi_sai' || 
                         (q.accuracyLevel === 'doi_luc_sai' && Math.random() > 0.3) ||
                         (q.accuracyLevel === 'thuong_sai' && Math.random() > 0.8);
        
        return {
          questionId: q.questionId,
          questionText: q.questionText,
          selectedAnswer: isCorrect ? correctAnswer : Math.floor(Math.random() * 4),
          correctAnswer: correctAnswer,
          isCorrect: isCorrect,
          answeredAt: '2025-10-19T23:45:00Z'
        };
      })
    }
  ];

  const activity: ActivityDetails = {
    id: '1',
    title: "Natalie Clarbull's Notes; Exam 5",
    description: "Medical terminology quiz covering cardiovascular and respiratory systems",
    topicId: 1,
    topicName: 'Medical Terminology',
    classId: 1,
    dueDate: '2025-10-19T23:59:00Z',
    createdAt: '2025-10-18T08:33:00Z',
    status: 'active',
    totalQuestions: 20,
    totalStudents: 1,
    completedStudents: 1,
    inProgressStudents: 0,
    notStartedStudents: 0,
    averageScore: 52,
    quizType: 'learning'
  };

  return {
    activity,
    students,
    performance,
    questions
  };
};
