import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Calendar, Play } from 'lucide-react';

interface CurrentLearning {
  topic: string;
  module: string;
  progress: number;
  timeRemaining: string;
  nextSession: string;
  difficulty: string;
}

interface CurrentProcessLearningProps {}
// TODO: change sample data by data fetching
const currentLearning = {
  topic: 'Advanced JavaScript Concepts',
  module: 'Closures and Scope',
  progress: 65,
  timeRemaining: '25 min',
  nextSession: 'Today, 3:00 PM',
  difficulty: 'Advanced',
};

const CurrentProcessLearning: React.FC<CurrentProcessLearningProps> = ({}) => {
  //TODO: implement continue learning functionality
  const onContinueLearning = (type: 'current' | 'next') => {
    alert(`Continue learning: ${type} session`);
  };

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-700 text-white border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Current Learning</CardTitle>
              <p className="text-gray-300">Based on your timeline schedule</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            {currentLearning.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">{currentLearning.topic}</h3>
              <p className="text-gray-300">Module: {currentLearning.module}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentLearning.progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${currentLearning.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{currentLearning.timeRemaining} remaining</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{currentLearning.nextSession}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <Button
              onClick={() => onContinueLearning('current')}
              size="lg"
              className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-8"
            >
              <Play className="mr-2 h-5 w-5" />
              Continue Learning
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentProcessLearning;
