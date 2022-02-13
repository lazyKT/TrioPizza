import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = (title, data) => {

  const maxNumOrders = Math.max(data?.map(d => parseInt(d.orders)));

  return {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Total Driver Orders/Deliveries Count'
        },
        min: 0,
        max: maxNumOrders > 5 ? maxNumOrders : 5,
        ticks: {
          // forces step size to be 50 units
          stepSize: maxNumOrders > 5 ? maxNumOrders/5 : 2
        }
      }
    }
  }
};


function prepareData (data) {

  return {
    labels: data?.map(d => d.name),
    datasets: [
      {
        label: 'Orders',
        data: data?.map(d => parseInt(d.orders)),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Deliveries',
        data: data?.map(d => parseInt(d.deliveries)),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
}

export default function CustomVerticalBar({data}) {

  const [ title, setTitle ] = React.useState('');

  React.useEffect(() => {
    if (data) setTitle('Driver Orders and Deliveries')
  }, [data]);

  return (
    <Bar
      height={200}
      options={options(title, data)}
      data={prepareData(data)}
    />
  );
}
