import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const options = (max) => {
  return {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Total Orders & Reservations Received'
        },
        min: 0,
        max: max + 10,
        ticks: {
          stepSize: max > 50 ? parseInt(max/10) : 5
        }
      }
    }
  }
};

const labels = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function createData (data) {
  const monthData = data?.map(d => (new Date(d.month)).getMonth());
  let months = Array(12).fill(0);

  monthData?.forEach((m, idx) => {
    months[m] = data[idx]?.count;
  });

  return months;
}

function prepareData (data1, data2) {
  // console.log('data1', data1?.map(d => d.count));
  return {
    labels,
    datasets: [
      {
        label: 'Orders',
        data: createData(data1),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Reservations',
        data: createData(data2),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
};


export default function LineChart({data1, data2}) {

  const [ max, setMax ] = useState(0);

  const cmpData = (arr1, arr2) => {

    const max1 = Math.max(...(arr1.map(a => parseInt(a.count))));
    const max2 = Math.max(...(arr2.map(a => parseInt(a.count))));

    return Math.max(max1, max2);
  };

  useEffect(() => {
    if (data1 && data2) {
      setMax(cmpData(data1, data2));
    }
  }, [data1, data2]);

  return (
    <Line
      options={options(max)}
      data={prepareData(data1, data2)}
    />
  );
}
