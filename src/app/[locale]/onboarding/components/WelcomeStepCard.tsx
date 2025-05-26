import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface WelcomeStepCardProps {
  proceed: () => void;
}

const WelcomeStepCard: React.FC<WelcomeStepCardProps> = ({ proceed }) => {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 text-sm ">Step 1 of 5</div>
        <div className="w-full h-1  rounded mb-6">
          <div className="h-1 bg-blue-500 rounded" style={{ width: '20%' }}></div>
        </div>
        <div className="flex justify-center mb-6">
          <div className=" p-4 rounded-full">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-center  mb-2">
          Welcome to Your Learning Journey
        </h1>
        <p className="text-center  mb-6">
          Let's personalize your experience to help you learn more effectively. We'll ask a few
          questions to understand your learning preferences.
        </p>
        <div className=" p-4 text-sm rounded mb-6">
          This information helps us suggest content and learning methods that match your unique
          style and goals. You can always change these preferences later.
        </div>
        <div className="flex justify-between">
          <Button variant="outline">Skip for now</Button>
          <Button onClick={proceed}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeStepCard;
