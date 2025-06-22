import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface DailyStudyBarChartProps {
  data: Array<{ day: string; hours: number; date: string }>;
}

export default function DailyStudyBarChart({ data }: DailyStudyBarChartProps) {
  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: 'Study Hours',
        data: data.map((d) => d.hours),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Bar data={chartData} />
    </div>
  );
}
