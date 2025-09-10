'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button, cn, Flex, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui';

// Dynamically import chart components to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });
const ChartJSVisualization = dynamic(() => import('@repo/common/components').then(mod => ({ default: mod.ChartJSVisualization })), { ssr: false });

// Mock data for demonstration - replace with actual API calls
const generateMockData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      latitude: 20 + Math.random() * 40, // Between 20-60 degrees
      longitude: 70 + Math.random() * 40, // Between 70-110 degrees
      salinity: 34 + Math.random() * 4, // Between 34-38 PSU
      temperature: 15 + Math.random() * 20, // Between 15-35°C
      depth: Math.random() * 1000, // 0-1000m depth
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      chlorophyll: Math.random() * 10, // 0-10 mg/m³
    });
  }
  return data;
};

const mockData = generateMockData();

const VisualizationPage = () => {
  const [selectedVariable, setSelectedVariable] = useState('salinity');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeChart, setActiveChart] = useState('map');
  const [chartLibrary, setChartLibrary] = useState('plotly'); // 'plotly' or 'chartjs'
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

  const renderFloatMap = () => {
    const plotData = [{
      type: 'scattermapbox' as const,
      lat: filteredData.map(d => d.latitude),
      lon: filteredData.map(d => d.longitude),
      mode: 'markers' as const,
      marker: {
        size: 8,
        color: filteredData.map(d => d[selectedVariable as keyof typeof d] as number),
        colorscale: 'Viridis' as const,
        showscale: true,
        colorbar: {
          title: `${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)} ${
            selectedVariable === 'salinity' ? '(PSU)' : 
            selectedVariable === 'temperature' ? '(°C)' : '(mg/m³)'
          }`,
        },
      },
      text: filteredData.map(d => 
        `Lat: ${d.latitude.toFixed(2)}<br>Lon: ${d.longitude.toFixed(2)}<br>${selectedVariable}: ${d[selectedVariable as keyof typeof d]}`
      ),
      hovertemplate: '%{text}<extra></extra>',
    }];

    const layout = {
      title: {
        text: `Global Float Map - ${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)}`,
      },
      mapbox: {
        style: 'open-street-map',
        center: { lat: 40, lon: 85 },
        zoom: 3,
      },
      margin: { r: 0, t: 50, l: 0, b: 0 },
      height: 600,
    };

    return <Plot data={plotData} layout={layout} style={{ width: '100%', height: '600px' }} />;
  };

  const renderProfilePlot = () => {
    // Group data by location and create depth profiles
    const profiles = filteredData.slice(0, 10).map((d, index) => ({
      x: Array.from({ length: 20 }, (_, i) => d[selectedVariable as keyof typeof d] as number + (Math.random() - 0.5) * 2),
      y: Array.from({ length: 20 }, (_, i) => i * 50), // Depth from 0 to 950m
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: `Profile ${index + 1}`,
      line: { width: 2 },
    }));

    const layout = {
      title: {
        text: `Depth Profile - ${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)}`,
      },
      xaxis: { 
        title: {
          text: `${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)} ${
            selectedVariable === 'salinity' ? '(PSU)' : 
            selectedVariable === 'temperature' ? '(°C)' : '(mg/m³)'
          }`
        }
      },
      yaxis: { 
        title: {
          text: 'Depth (m)'
        },
        autorange: 'reversed' as const // Depth increases downward
      },
      height: 600,
      showlegend: true,
    };

    return <Plot data={profiles} layout={layout} style={{ width: '100%', height: '600px' }} />;
  };

  const renderTimeSeries = () => {
    // Sort data by date and create time series
    const sortedData = filteredData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const timeSeriesData = [{
      x: sortedData.map(d => d.date),
      y: sortedData.map(d => d[selectedVariable as keyof typeof d] as number),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1),
      line: { color: '#2563eb', width: 2 },
      marker: { size: 6 },
    }];

    const layout = {
      title: {
        text: `Time Series - ${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)}`,
      },
      xaxis: { 
        title: {
          text: 'Date'
        }
      },
      yaxis: { 
        title: {
          text: `${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)} ${
            selectedVariable === 'salinity' ? '(PSU)' : 
            selectedVariable === 'temperature' ? '(°C)' : '(mg/m³)'
          }`
        }
      },
      height: 600,
    };

    return <Plot data={timeSeriesData} layout={layout} style={{ width: '100%', height: '600px' }} />;
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (chartLibrary === 'chartjs') {
      return <ChartJSVisualization />;
    }

    switch (activeChart) {
      case 'map':
        return renderFloatMap();
      case 'profile':
        return renderProfilePlot();
      case 'timeseries':
        return renderTimeSeries();
      default:
        return renderFloatMap();
    }
  };

  if (chartLibrary === 'chartjs') {
    return <ChartJSVisualization />;
  }

  return (
    <div className="flex flex-col h-full w-full p-6 bg-background">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Ocean Data Visualization</h1>
        <p className="text-muted-foreground">
          Explore oceanographic data through interactive charts and maps
        </p>
      </div>

      {/* Library Selector */}
      <div className="mb-6">
        <Flex gap="sm" items="center">
          <span className="text-sm font-medium text-foreground">Chart Library:</span>
          <Button
            variant={chartLibrary === 'plotly' ? 'default' : 'secondary'}
            onClick={() => setChartLibrary('plotly')}
          >
            Plotly (Maps + Advanced)
          </Button>
          <Button
            variant={chartLibrary === 'chartjs' ? 'default' : 'secondary'}
            onClick={() => setChartLibrary('chartjs')}
          >
            Chart.js (Simple Charts)
          </Button>
        </Flex>
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

      {/* Chart Type Selector (only for Plotly) */}
      <div className="mb-6">
        <Flex gap="sm">
          <Button
            variant={activeChart === 'map' ? 'default' : 'secondary'}
            onClick={() => setActiveChart('map')}
          >
            Global Map
          </Button>
          <Button
            variant={activeChart === 'profile' ? 'default' : 'secondary'}
            onClick={() => setActiveChart('profile')}
          >
            Depth Profile
          </Button>
          <Button
            variant={activeChart === 'timeseries' ? 'default' : 'secondary'}
            onClick={() => setActiveChart('timeseries')}
          >
            Time Series
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

export default VisualizationPage;
