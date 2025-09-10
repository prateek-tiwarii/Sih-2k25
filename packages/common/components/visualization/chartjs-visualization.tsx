'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';
import { Button, cn, Flex, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

// Mock data generator
const generateMockData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      latitude: 20 + Math.random() * 40,
      longitude: 70 + Math.random() * 40,
      salinity: 34 + Math.random() * 4,
      temperature: 15 + Math.random() * 20,
      depth: Math.random() * 1000,
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      chlorophyll: Math.random() * 10,
    });
  }
  return data;
};

const mockData = generateMockData();

const ChartJSVisualization = () => {
  const [selectedVariable, setSelectedVariable] = useState('salinity');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeChart, setActiveChart] = useState('timeseries');
  const [isLoading, setIsLoading] = useState(false);

  // Filter data based on selections
  const filteredData = mockData.filter(item => {
    if (selectedMonth !== 'all' && item.date.getMonth() !== parseInt(selectedMonth)) {
      return false;
    }
    if (selectedYear !== 'all' && item.date.getFullYear() !== parseInt(selectedYear)) {
      return false;
    }
    return true;
  });

  const renderTimeSeriesChart = () => {
    const sortedData = filteredData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const data = {
      labels: sortedData.map(d => d.date.toLocaleDateString()),
      datasets: [
        {
          label: `${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)} ${
            selectedVariable === 'salinity' ? '(PSU)' : 
            selectedVariable === 'temperature' ? '(°C)' : '(mg/m³)'
          }`,
          data: sortedData.map(d => d[selectedVariable as keyof typeof d] as number),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
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
        title: {
          display: true,
          text: `Time Series - ${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)}`,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    };

    return (
      <div style={{ height: '500px' }}>
        <Line data={data} options={options} />
      </div>
    );
  };

  const renderScatterChart = () => {
    const data = {
      datasets: [
        {
          label: `${selectedVariable} vs Depth`,
          data: filteredData.map(d => ({
            x: d[selectedVariable as keyof typeof d] as number,
            y: d.depth,
          })),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
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
        title: {
          display: true,
          text: `Depth Profile - ${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)}`,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: `${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)} ${
              selectedVariable === 'salinity' ? '(PSU)' : 
              selectedVariable === 'temperature' ? '(°C)' : '(mg/m³)'
            }`,
          },
        },
        y: {
          title: {
            display: true,
            text: 'Depth (m)',
          },
          reverse: true, // Depth increases downward
        },
      },
    };

    return (
      <div style={{ height: '500px' }}>
        <Scatter data={data} options={options} />
      </div>
    );
  };

  const renderLocationChart = () => {
    const data = {
      datasets: [
        {
          label: 'Geographic Distribution',
          data: filteredData.map(d => ({
            x: d.longitude,
            y: d.latitude,
          })),
          backgroundColor: filteredData.map(d => {
            const value = d[selectedVariable as keyof typeof d] as number;
            const normalized = selectedVariable === 'salinity' ? (value - 34) / 4 : 
                             selectedVariable === 'temperature' ? (value - 15) / 20 :
                             value / 10;
            return `rgba(59, 130, 246, ${0.3 + normalized * 0.7})`;
          }),
          borderColor: 'rgb(59, 130, 246)',
          pointRadius: 6,
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
        title: {
          display: true,
          text: `Geographic Distribution - ${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)}`,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const dataIndex = context.dataIndex;
              const item = filteredData[dataIndex];
              return [
                `Lat: ${item.latitude.toFixed(2)}°`,
                `Lon: ${item.longitude.toFixed(2)}°`,
                `${selectedVariable}: ${item[selectedVariable as keyof typeof item]}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Longitude (°)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Latitude (°)',
          },
        },
      },
    };

    return (
      <div style={{ height: '500px' }}>
        <Scatter data={data} options={options} />
      </div>
    );
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeChart) {
      case 'timeseries':
        return renderTimeSeriesChart();
      case 'profile':
        return renderScatterChart();
      case 'location':
        return renderLocationChart();
      default:
        return renderTimeSeriesChart();
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-6 bg-background">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Ocean Data Visualization (Chart.js)</h1>
        <p className="text-muted-foreground">
          Alternative visualization using Chart.js library
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-card border rounded-lg">
        <Flex gap="md" items="center" className="flex-wrap">
          <div className="min-w-[120px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Variable</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="w-full justify-between">
                  {selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedVariable('salinity')}>
                  Salinity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedVariable('temperature')}>
                  Temperature
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedVariable('chlorophyll')}>
                  Chlorophyll
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="min-w-[120px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Month</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="w-full justify-between">
                  {selectedMonth === 'all' ? 'All Months' : 
                   ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(selectedMonth)] || 'All Months'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedMonth('all')}>All Months</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('0')}>January</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('1')}>February</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('2')}>March</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('3')}>April</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('4')}>May</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('5')}>June</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('6')}>July</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('7')}>August</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('8')}>September</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('9')}>October</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('10')}>November</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedMonth('11')}>December</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="min-w-[120px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Year</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="w-full justify-between">
                  {selectedYear === 'all' ? 'All Years' : selectedYear}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedYear('all')}>All Years</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedYear('2024')}>2024</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedYear('2023')}>2023</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedYear('2022')}>2022</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Flex>
      </div>

      {/* Chart Type Selector */}
      <div className="mb-6">
        <Flex gap="sm">
          <Button
            variant={activeChart === 'timeseries' ? 'default' : 'secondary'}
            onClick={() => setActiveChart('timeseries')}
          >
            Time Series
          </Button>
          <Button
            variant={activeChart === 'profile' ? 'default' : 'secondary'}
            onClick={() => setActiveChart('profile')}
          >
            Depth Profile
          </Button>
          <Button
            variant={activeChart === 'location' ? 'default' : 'secondary'}
            onClick={() => setActiveChart('location')}
          >
            Location Plot
          </Button>
        </Flex>
      </div>

      {/* Chart Container */}
      <div className="flex-1 bg-card border rounded-lg p-4">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartJSVisualization;
