'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar as BarChart } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { UserBasic } from '@/types/user';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type UserSignupChartProps = {
  users: UserBasic[];
};

export function UserSignupChart({ users }: UserSignupChartProps) {
  const [userData, setUserData] = useState<number[]>([]);

  useEffect(() => {
    const counts = countUsersByDay(users);
    setUserData(counts);
  }, [users]);

  const data = {
    labels: daysOfWeek,
    datasets: [
      {
        label: 'New Users',
        data: userData,
        backgroundColor: '#6366f1',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <BarChart options={options} data={data} />;
}

function countUsersByDay(users: UserBasic[]): number[] {
  const countMap = new Map<string, number>();
  daysOfWeek.forEach((day) => countMap.set(day, 0));

  users.forEach((user) => {
    const date = new Date(user.createdAt);
    const day = daysOfWeek[date.getDay()];
    countMap.set(day, (countMap.get(day) || 0) + 1);
  });

  return daysOfWeek.map((day) => countMap.get(day) || 0);
}
