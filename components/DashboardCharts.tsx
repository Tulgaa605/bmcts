'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const months = ['1','2','3','4','5','6','7','8','9','10','11','12'];

export default function DashboardCharts({ data }: { data: { monthlyIncome: number[]; monthlyExpense: number[]; monthlySales: number[] } }) {
  const opts = { responsive: true, plugins: { legend: { position: 'top' as const } }, scales: { y: { beginAtZero: true } } };

  return (
    <div className="grid grid-cols-1 gap-4 p-3 sm:p-4 md:grid-cols-2 lg:grid-cols-3 lg:p-5">
      <div className="card">
        <h3 className="mb-3 text-center text-sm font-semibold text-nebo-primary">Орлого, зарлага, өртөгийн график</h3>
        <Line data={{
          labels: months,
          datasets: [
            { label: 'Орлого', data: data.monthlyIncome, borderColor: '#e74c3c', tension: 0.3 },
            { label: 'Зарлага', data: data.monthlyExpense, borderColor: '#3498db', tension: 0.3 },
          ],
        }} options={opts} />
      </div>
      <div className="card">
        <h3 className="mb-3 text-center text-sm font-semibold text-nebo-primary">Борлуулалтын график</h3>
        <Line data={{
          labels: months,
          datasets: [{ label: 'Борлуулалт', data: data.monthlySales, borderColor: '#e74c3c', tension: 0.3 }],
        }} options={opts} />
      </div>
      <div className="card">
        <h3 className="mb-3 text-center text-sm font-semibold text-nebo-primary">Зарлагын график</h3>
        <Line data={{
          labels: months,
          datasets: [{ label: 'Зардал', data: data.monthlyExpense, borderColor: '#27ae60', tension: 0.3 }],
        }} options={opts} />
      </div>
    </div>
  );
}
