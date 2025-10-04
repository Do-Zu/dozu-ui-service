import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface TopicTagStepCardProps {
  interestedTopicTags: string[];
  proceed: () => void;
  goBack: () => void;
  addTopicTag: (tag: string) => void;
  removeTopicTag: (tag: string) => void;
}

const popularTopicTags = [
  'Web Development',
  'Data Science',
  'UX/UI Design',
  'Digital Marketing',
  'Machine Learning',
  'Language Learning',
  'Business Strategy',
  'Personal Finance',
];
const TopicTagStepCard: React.FC<TopicTagStepCardProps> = ({
  interestedTopicTags,
  proceed,
  goBack,
  addTopicTag,
  removeTopicTag,
}) => {
  const handleTopicTagClick = (topicTag: string) => {
    if (interestedTopicTags.indexOf(topicTag) >= 0) {
      removeTopicTag(topicTag);
    } else {
      addTopicTag(topicTag);
    }
  };

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <div className="mb-4 text-sm">Step 2 of 5</div>
        <div className="w-full h-1 rounded mb-6">
          <div className="h-1 bg-blue-500 rounded" style={{ width: '40%' }}></div>
        </div>
        <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 " />
          What do you want to learn?
        </h1>
        <p className="text-smmb-4">
          Choose a topic you're interested in or search for something specific.
        </p>
        <input
          type="text"
          placeholder="🔍 Search for a topic..."
          className="w-full px-4 py-2 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mb-6 space-y-2">
          <p className="text-sm">Popular topics:</p>
          <div className="flex flex-wrap gap-2">
            {popularTopicTags.map((topicTag) => (
              <button
                key={topicTag}
                className={
                  'px-4 py-2 text-sm font-medium border rounded-full ' +
                  (interestedTopicTags.indexOf(topicTag) >= 0 ? 'ring-2 ring-blue-500' : '')
                }
                onClick={() => {
                  handleTopicTagClick(topicTag);
                }}
              >
                {topicTag}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={goBack}>
            Back
          </Button>

          <Button onClick={proceed}>{interestedTopicTags.length > 0 ? 'Continue' : 'Skip'}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicTagStepCard;
