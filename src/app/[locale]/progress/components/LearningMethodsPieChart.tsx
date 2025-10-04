import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { ContentType } from '@/types/progress';

Chart.register(ArcElement, Tooltip, Legend);

interface LearningMethodsPieChartProps {
  data: Array<{ method: ContentType; count: number }>;
}

const COLORS = [
  '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
];

export default function LearningMethodsPieChart({ data }: LearningMethodsPieChartProps) {
  const chartData = {
    labels: data.map((d) => d.method),
    datasets: [
      {
        label: 'Learning Methods',
        data: data.map((d) => d.count),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <Pie data={chartData} />
    </div>
  );
}
