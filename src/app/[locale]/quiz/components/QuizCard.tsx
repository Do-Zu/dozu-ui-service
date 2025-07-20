// Chức năng: Hiển thị thông tin tóm tắt về một bài quiz, bao gồm tên quiz, điểm số (nếu có), và thời gian làm.
// Sử dụng: Được sử dụng trong các trang như danh sách quiz trong quiz/history.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizCardProps {
  quizId: number;
  quizTitle: string;
  totalScore: number;
  onClickViewDetails: () => void;
}

const QuizCard = ({ quizId, quizTitle, totalScore, onClickViewDetails }: QuizCardProps) => (
  <Card onClick={onClickViewDetails} className="mb-4 cursor-pointer">
    <CardHeader>
      <CardTitle>{quizTitle}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Total Score: {totalScore}</p>
    </CardContent>
  </Card>
);

export default QuizCard;
