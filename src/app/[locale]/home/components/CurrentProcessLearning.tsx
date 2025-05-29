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
    <Card className="max-w-[80%] mx-auto mt-2 mb-8 bg-gradient-to-r from-gray-800 to-gray-700 text-white border-0 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-lg">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Current Learning</CardTitle>
              <p className="text-gray-300 text-sm">Based on your timeline schedule</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 text-sm">
            {currentLearning.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div>
              <h3 className="text-base font-semibold mb-0.5">{currentLearning.topic}</h3>
              <p className="text-gray-300 text-sm">Module: {currentLearning.module}</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{currentLearning.progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white rounded-full h-1.5 transition-all duration-300"
                  style={{ width: `${currentLearning.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{currentLearning.timeRemaining} remaining</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{currentLearning.nextSession}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <Button
              onClick={() => onContinueLearning('current')}
              size="default"
              className="bg-white text-gray-800 hover:bg-gray-100 font-semibold px-6 py-2"
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Continue Learning
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentProcessLearning;
