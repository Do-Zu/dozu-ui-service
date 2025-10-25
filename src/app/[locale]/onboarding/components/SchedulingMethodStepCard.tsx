import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { CalendarRange } from 'lucide-react';

interface SchedulingMethodStepCardProps {

  goBack: () => void;

}

const choices = [
  {
    label: '15 minutes per day',
    desc: 'Quick, bite-sized learning sessions',
    value: 15,
  },
  {
    label: '30 minutes per day',
    desc: 'Short, focused learning periods',
    value: 30,
  },
  {
    label: '60 minutes per day',
    desc: 'Moderate study sessions',
    value: 60,
  },

  {
    label: 'Irregular schedule',
    desc: 'Flexible, when time permits',
    value: 0,
  },
];

const SchedulingMethodStepCard: React.FC<SchedulingMethodStepCardProps> = ({  goBack }) => {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 text-sm">Step 5 of 6</div>
        <div className="w-full h-1 rounded mb-6">
          <div className="h-1 bg-blue-500 rounded" style={{ width: '83%' }}></div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <CalendarRange className="w-5 h-5" />
          <h2 className="text-lg font-semibold">How do you want your schedule to be setup?</h2>
        </div>
        <p className="text-sm mb-6">
          This helps us recommend appropriate schedules.
        </p>
        <div className="space-y-3 mb-6">
          {choices.map((option, index) => (
            <div
              key={index}
              className={
                ' border rounded p-4 cursor-pointer flex items-start gap-3 ' 
                // +
                // (studyDuration === option.value ? 'ring-2 ring-blue-500' : '')
              }
              onClick={() => {
                // setStudyDuration(option.value);
              }}
            >
              <div className="mt-1">
                <div
                  className={
                    ' w-4 h-4 border rounded-full ' 
                    // +
                    // (studyDuration === option.value ? 'bg-blue-500' : '')
                  }
                ></div>
              </div>
              <div>
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs">{option.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={goBack}>
            Back
          </Button>
          <Button onClick={() => {}}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchedulingMethodStepCard;
