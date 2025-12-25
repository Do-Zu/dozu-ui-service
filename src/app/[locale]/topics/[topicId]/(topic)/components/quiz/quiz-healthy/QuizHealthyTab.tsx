'use client';

import { useEffect, useMemo, useState } from 'react';
import QuestionHealthCard from './QuestionHealthCard';
import { sortByHealthAsc, buildHealthPrompt } from './health.utils';
import { QuestionHealthDTO } from '../types/questionHealth.type';
import LoadingPage from '@/app/loading';
import { useTopicWorkspace } from '@/app/[locale]/topics/[topicId]/(topic)/context/TopicWorkspaceContext';
import { quizService } from '@/app/[locale]/quiz/services/quiz.service';
import { toast } from '@/hooks/use-toast';

const FILTERS: Array<'all' | 'critical' | 'weak' | 'healthy'> = [
  'all',
  'critical',
  'weak',
  'healthy',
];

export default function QuizHealthyTab() {
  const { topicId, topic } = useTopicWorkspace();

  const [items, setItems] = useState<QuestionHealthDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'weak' | 'healthy'>(
    'all'
  );

  useEffect(() => {
    if (!topicId) return;

    setLoading(true);

    quizService
      .getQuestionHealth(topicId)
      .then((res) => {
        if (res.status === 'success') {
          setItems(res.data.items);
        }
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  const filteredItems = useMemo(() => {
    let data = [...items].sort(sortByHealthAsc);

    if (filter !== 'all') {
      data = data.filter((q) => q.healthLevel === filter);
    }

    return data;
  }, [items, filter]);

  const handleCopyHealthReport = async () => {
    const text = buildHealthPrompt(topic?.name ?? '', items);

    await navigator.clipboard.writeText(text);

    toast({
      title: 'Copied for AI',
      description:
        'Question health report copied. Paste into ChatGPT or any AI tool.',
    });
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Question Health</h2>
          <p className="text-sm text-muted-foreground">
            Analyze learning stability and spaced-repetition performance
          </p>
        </div>

        <button
          onClick={handleCopyHealthReport}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-muted transition"
        >
           Copy for AI
        </button>
      </div>

        
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded border transition ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-background hover:bg-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <QuestionHealthCard key={item.questionId} item={item} />
        ))}

        {filteredItems.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-10">
            No questions match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
