import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  Title 
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  BarElement, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend,
  Title
);

interface DailyStudyBarChartProps {
  data: Array<{ day: string; hours: number; date: string }>;
}

export default function DailyStudyBarChart({ data }: DailyStudyBarChartProps) {
  // Debug log to check data
  console.log('DailyStudyBarChart received data:', data);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p>No study data available for the selected period</p>
          <p className="text-sm mt-2">Start studying to see your progress!</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: 'Study Hours',
        data: data.map((d) => d.hours),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} hours`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + 'h';
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}
