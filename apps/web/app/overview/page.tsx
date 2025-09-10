import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";
import { 
  Waves, 
  Thermometer, 
  Fish, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Navigation
} from "lucide-react";

const OceanDashboard = () => {
  const metrics = [
    {
      title: "Water Temperature",
      value: "22.4°C",
      change: "+0.3°C",
      trend: "up",
      icon: Thermometer,
      description: "Pacific Ocean - Surface"
    },
    {
      title: "Wave Height", 
      value: "2.8m",
      change: "-0.4m",
      trend: "down", 
      icon: Waves,
      description: "Average coastal readings"
    },
    {
      title: "Marine Life Activity",
      value: "High",
      change: "+15%",
      trend: "up",
      icon: Fish,
      description: "Species detection rate"
    },
    {
      title: "Current Speed",
      value: "1.2 kn",
      change: "+0.1 kn", 
      trend: "up",
      icon: Activity,
      description: "Gulf Stream velocity"
    }
  ];

  const locations = [
    { name: "Pacific Station Alpha", status: "active", depth: "1,200m" },
    { name: "Atlantic Monitor Beta", status: "maintenance", depth: "850m" },
    { name: "Arctic Research Gamma", status: "active", depth: "450m" },
    { name: "Indian Ocean Delta", status: "active", depth: "2,100m" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src="/oceanHERO.avif" 
          alt="Deep ocean underwater scene with bioluminescent life" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Ocean<span className="text-[#0284c7]">Flow</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#06b6d4]">
              Real-time marine monitoring dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Status Banner */}
        <div className="mb-8 p-4 rounded-lg border" style={{ background: "linear-gradient(to right, #0284c7, #06b6d4)", borderColor: "#1e3a8a" }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-white" />
              <span className="text-white font-medium">System Status: All stations operational</span>
            </div>
            <Badge className="bg-white/20 text-white border border-white/40">
              Last updated: 2 minutes ago
            </Badge>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#0284c7] transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-5 h-5 text-[#0284c7]" />
                    <CardTitle className="text-sm font-medium text-[#1e3a8a]">
                      {metric.title}
                    </CardTitle>
                  </div>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-[#06b6d4]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[#38bdf8]" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${metric.trend === 'up' ? 'text-[#06b6d4]' : 'text-[#38bdf8]'}`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-gray-500">
                    {metric.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monitoring Stations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-[#f8fafc] border border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Navigation className="w-5 h-5 text-[#0284c7]" />
                Monitoring Stations
              </CardTitle>
              <CardDescription className="text-gray-500">
                Active research and monitoring locations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {locations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: "#e0f2fe", borderColor: "#0284c7" }}>
                  <div>
                    <div className="font-medium text-gray-900">{location.name}</div>
                    <div className="text-sm text-gray-500">Depth: {location.depth}</div>
                  </div>
                  <Badge 
                    className={location.status === 'active' 
                      ? "bg-[#06b6d4] text-white" 
                      : "bg-gray-200 text-gray-500"
                    }
                  >
                    {location.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#f8fafc] border border-[#e2e8f0]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Activity className="w-5 h-5 text-[#0284c7]" />
                Ocean Insights
              </CardTitle>
              <CardDescription className="text-gray-500">
                Latest marine research findings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border" style={{ backgroundColor: "#f0f9ff", borderColor: "#0284c7" }}>
                <h4 className="font-medium text-gray-900 mb-2">Coral Reef Recovery</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Recent monitoring shows 23% improvement in coral health across monitored reef systems.
                </p>
                <Button variant="outlined" size="sm" className="border-[#0284c7] text-[#0284c7] hover:bg-[#0284c7] hover:text-white">
                  View Report
                </Button>
              </div>
              
              <div className="p-4 rounded-lg border" style={{ backgroundColor: "#ecfeff", borderColor: "#06b6d4" }}>
                <h4 className="font-medium text-gray-900 mb-2">Whale Migration Patterns</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Tracking data reveals new migration routes in response to changing ocean temperatures.
                </p>
                <Button variant="outlined" size="sm" className="border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-white">
                  Explore Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OceanDashboard;
