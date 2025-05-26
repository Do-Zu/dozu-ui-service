import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';

const choices = [
  {
    label: 'Flashcards',
    desc: 'Memorize knowledge with spaced repetition',
  },
  {
    label: 'Quizzes',
    desc: 'Test your knowledge',
  },
];

const StudyMethodStepCard: React.FC = ({
  studyMethods,
  proceed,
  goBack,
  addStudyMethod,
  removeStudyMethod,
}) => {
  const handleStudyMethodClick = (studyMethod: string) => {
    if (studyMethods.indexOf(studyMethod) >= 0) {
      removeStudyMethod(studyMethod);
    } else {
      addStudyMethod(studyMethod);
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 text-sm">Step 4 of 5</div>
        <div className="w-full h-1 rounded mb-6">
          <div className="h-1 bg-blue-500 rounded" style={{ width: '80%' }}></div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Settings2 className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Which study methods do you prefer?</h2>
        </div>
        <p className="text-sm mb-6">This helps us recommend appropriate content types.</p>
        <div className="space-y-3 mb-6">
          {choices.map((option, index) => (
            <div
              key={index}
              className={
                ' border rounded p-4 cursor-pointer flex items-start gap-3 ' +
                (studyMethods.indexOf(option.label) >= 0 ? 'ring-2 ring-blue-500' : '')
              }
              onClick={() => {
                handleStudyMethodClick(option.label);
              }}
            >
              <div className="mt-1">
                <div
                  className={
                    'w-4 h-4 border  flex items-center justify-center ' +
                    (studyMethods.indexOf(option.label) >= 0 ? 'bg-blue-500 text-white' : '')
                  }
                >
                  {studyMethods.indexOf(option.label) >= 0 && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
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
          <Button onClick={proceed}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyMethodStepCard;
