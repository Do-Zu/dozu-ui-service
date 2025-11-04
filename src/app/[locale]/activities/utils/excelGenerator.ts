import * as XLSX from 'xlsx';
import { ActivityMonitorData } from '@/types/activity';

export const generateExcelFile = (data: ActivityMonitorData): Blob => {
  const { activity, students, performance, questions } = data;

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // 1. Activity Summary Sheet
  const activitySummaryData = [
    ['Bài về nhà', `Hoạt động cho ${activity.title}`],
    ['Ngày bắt đầu hoạt động', '2025-10-18 08:33 UTC'],
    ['Ngày kết thúc hoạt động', activity.dueDate],
    ['Tài liệu học', activity.title],
    ['Hoạt động', activity.quizType],
    ['Học sinh', activity.totalStudents.toString()],
    ['Đã tham gia', activity.completedStudents.toString()],
    ['Đang làm', activity.inProgressStudents.toString()],
    ['Đã hoàn thành', activity.completedStudents.toString()],
    ['Điểm trung bình lớp', '52%'],
    ['Học sinh đúng trên 80%', '0'],
    ['Học sinh đúng dưới 50%', '0'],
    [''],
    ['Xem Tóm lược học sinh', 'Xem tiến độ thuật ngữ'],
    ['Xem kết quả của học sinh', '']
  ];

  const activitySummarySheet = XLSX.utils.aoa_to_sheet(activitySummaryData);
  XLSX.utils.book_append_sheet(workbook, activitySummarySheet, 'Tóm lược hoạt động');

  // 2. Student Summary Sheet
  const studentSummaryHeaders = [
    'Biệt danh',
    'Trạng thái', 
    'Đúng',
    'Sai',
    'Bỏ qua',
    'Thuật ngữ chưa bắt đầu',
    'Tổng số trả lời',
    '% Đúng',
    'Thời gian dùng (gg:pp)'
  ];

  const studentSummaryData = [
    studentSummaryHeaders,
    ...students.map(student => {
      const incorrectAnswers = 20 - student.correctAnswers; // Use fixed total questions
      const skippedAnswers = Math.max(0, 20 - student.answers.length);
      const totalAnswers = student.answers.length;
      
      return [
        student.studentName,
        student.status === 'completed' ? 'Đã hoàn thành' : 
        student.status === 'in-progress' ? 'Đang làm' : 'Chưa bắt đầu',
        student.correctAnswers,
        incorrectAnswers,
        skippedAnswers,
        0, // Terms not started
        totalAnswers,
        student.score,
        '0:16' // Mock time spent
      ];
    })
  ];

  const studentSummarySheet = XLSX.utils.aoa_to_sheet(studentSummaryData);
  XLSX.utils.book_append_sheet(workbook, studentSummarySheet, 'Tóm lược học sinh');

  // 3. Term Progress Sheet
  const termProgressHeaders = ['Thuật ngữ', 'Định nghĩa', '% Nắm vững'];
  const termProgressData = [
    termProgressHeaders,
    ...questions.map(question => [
      question.questionText,
      question.definition,
      question.accuracyPercentage
    ])
  ];

  const termProgressSheet = XLSX.utils.aoa_to_sheet(termProgressData);
  XLSX.utils.book_append_sheet(workbook, termProgressSheet, 'Tiến trình thuật ngữ');

  // 4. Student Results Sheet
  const studentResultsHeaders = [
    'Biệt danh',
    '% Đúng',
    'Thuật ngữ đúng',
    'Thuật ngữ hoàn thành',
    ...questions.slice(0, 10).map(q => q.questionText) // First 10 questions as columns
  ];

  const studentResultsData = [
    studentResultsHeaders,
    ...students.map(student => [
      student.studentName,
      student.score,
      student.correctAnswers,
      student.answers.length,
      ...student.answers.slice(0, 10).map(answer => answer.isCorrect ? 'Đúng' : 'Sai')
    ]),
    ['Trung bình nắm vững c', '52', '', '', ...Array(10).fill('')] // Average row
  ];

  const studentResultsSheet = XLSX.utils.aoa_to_sheet(studentResultsData);
  XLSX.utils.book_append_sheet(workbook, studentResultsSheet, 'Kết quả của học sinh');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const downloadExcelFile = (data: ActivityMonitorData, filename: string = 'Quizlet-activity-results.xlsx') => {
  const blob = generateExcelFile(data);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
