import { LearningMethodsChart } from './LearningMethodsChart';

interface StatsLearningMethodsProps {
  methods: {
    [key: string]: number;
  };
}

export function StatsLearningMethods({ methods }: StatsLearningMethodsProps) {
  return (
    <div className="py-4">
      <LearningMethodsChart methods={methods} />
    </div>
  );
}
