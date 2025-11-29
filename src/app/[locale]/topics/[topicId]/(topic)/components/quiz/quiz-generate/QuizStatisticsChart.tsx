'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { IQuizStatistics } from '../../../hooks/useQuizWorkspace';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
    statistics: IQuizStatistics | null;
}

export default function QuizStatisticsChart({ statistics }: Props) {
    const data = {
        labels: ['Total Quizzes', 'Average Score (%)', 'Perfect Scores', 'Avg Questions/Quiz'],
        datasets: [
            {
                label: 'Quiz Statistics',
                data: statistics
                    ? [
                          statistics.totalQuizzes,
                          statistics.averageScore,
                          statistics.perfectScoreCount,
                          statistics.averageQuestionsPerQuiz,
                      ]
                    : [0, 0, 0, 0],
                backgroundColor: '#4B89A3',
                borderColor: '#1E3A8A',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
    };

    return (
        <div className="bg-muted p-6 rounded-lg shadow-md border border-border">
            <Bar data={data} options={options} />
        </div>
    );
}
