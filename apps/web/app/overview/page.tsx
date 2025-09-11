import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import {
    Waves,
    Thermometer,
    Fish,
    Activity,
    TrendingUp,
    TrendingDown,
    Eye,
    Navigation,
} from 'lucide-react';

const OceanDashboard = () => {
    const metrics = [
        {
            title: 'Water Temperature',
            value: '22.4°C',
            change: '+0.3°C',
            trend: 'up',
            icon: Thermometer,
            description: 'Pacific Ocean - Surface',
        },
        {
            title: 'Wave Height',
            value: '2.8m',
            change: '-0.4m',
            trend: 'down',
            icon: Waves,
            description: 'Average coastal readings',
        },
        {
            title: 'Marine Life Activity',
            value: 'High',
            change: '+15%',
            trend: 'up',
            icon: Fish,
            description: 'Species detection rate',
        },
        {
            title: 'Current Speed',
            value: '1.2 kn',
            change: '+0.1 kn',
            trend: 'up',
            icon: Activity,
            description: 'Gulf Stream velocity',
        },
    ];

    const locations = [
        { name: 'Pacific Station Alpha', status: 'active', depth: '1,200m' },
        { name: 'Atlantic Monitor Beta', status: 'maintenance', depth: '850m' },
        { name: 'Arctic Research Gamma', status: 'active', depth: '450m' },
        { name: 'Indian Ocean Delta', status: 'active', depth: '2,100m' },
    ];

    return (
        <div className="min-h-screen bg-[#fafdff]">
            {/* Hero Section */}
            <div className="relative h-64 overflow-hidden md:h-80">
                <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                    alt="Vibrant underwater ocean scene with sunlight and marine life"
                    className="h-full w-full object-cover brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#cbd5e1]/60 via-[#e0f2fe]/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12">
                    <div className="text-left">
                        <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.5)] md:text-6xl">
                            Ocean<span className="text-[#38bdf8]">Flow</span>
                        </h1>
                        <p className="text-xl font-semibold text-white drop-shadow-[0_2px_12px_rgba(56,189,248,0.5)] md:text-2xl">
                            Real-time marine monitoring dashboard
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Status Banner */}
                <div
                    className="mb-8 rounded-lg border p-4 shadow-none"
                    style={{
                        background: 'linear-gradient(90deg, #f0f9ff 0%, #fafdff 100%)',
                        borderColor: '#e0e7ef',
                    }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Eye className="h-5 w-5 text-[#64748b] drop-shadow-none" />
                            <span className="font-semibold tracking-wide text-[#64748b]">
                                System Status: All stations operational
                            </span>
                        </div>
                        <Badge className="border border-[#e0e7ef] bg-white/80 text-[#64748b] shadow-none">
                            Last updated: 2 minutes ago
                        </Badge>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {metrics.map((metric, index) => (
                        <Card
                            key={index}
                            className="border border-[#e0e7ef] bg-gradient-to-br from-[#fafdff] via-[#f0f9ff] to-[#f6fbfd] shadow-none transition-colors hover:border-[#bae6fd]"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <metric.icon className="h-5 w-5 text-[#93c5fd] drop-shadow-none" />
                                        <CardTitle className="text-sm font-semibold text-[#64748b]">
                                            {metric.title}
                                        </CardTitle>
                                    </div>
                                    {metric.trend === 'up' ? (
                                        <TrendingUp className="h-4 w-4 text-[#bae6fd]" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-[#cbd5e1]" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-1 text-2xl font-bold text-[#64748b]">
                                    {metric.value}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`text-sm ${metric.trend === 'up' ? 'text-[#93c5fd]' : 'text-[#cbd5e1]'}`}
                                    >
                                        {metric.change}
                                    </span>
                                    <span className="text-xs text-[#64748b]">
                                        {metric.description}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Monitoring Stations */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <Card className="border border-[#e0e7ef] bg-[#fafdff]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#64748b]">
                                <Navigation className="h-5 w-5 text-[#93c5fd]" />
                                Monitoring Stations
                            </CardTitle>
                            <CardDescription className="text-[#94a3b8]">
                                Active research and monitoring locations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {locations.map((location, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                    style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}
                                >
                                    <div>
                                        <div className="font-medium text-[#64748b]">
                                            {location.name}
                                        </div>
                                        <div className="text-sm text-[#94a3b8]">
                                            Depth: {location.depth}
                                        </div>
                                    </div>
                                    <Badge
                                        className={
                                            location.status === 'active'
                                                ? 'bg-[#bae6fd] text-[#64748b]'
                                                : 'bg-gray-100 text-[#94a3b8]'
                                        }
                                    >
                                        {location.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border border-[#e0e7ef] bg-[#fafdff]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#64748b]">
                                <Activity className="h-5 w-5 text-[#93c5fd]" />
                                Ocean Insights
                            </CardTitle>
                            <CardDescription className="text-[#94a3b8]">
                                Latest marine research findings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className="rounded-lg border p-4"
                                style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}
                            >
                                <h4 className="mb-2 font-medium text-[#64748b]">
                                    Coral Reef Recovery
                                </h4>
                                <p className="mb-3 text-sm text-[#94a3b8]">
                                    Recent monitoring shows 23% improvement in coral health across
                                    monitored reef systems.
                                </p>
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    className="border-[#bae6fd] text-[#64748b] hover:bg-[#bae6fd] hover:text-[#64748b]"
                                >
                                    View Report
                                </Button>
                            </div>

                            <div
                                className="rounded-lg border p-4"
                                style={{ backgroundColor: '#fafdff', borderColor: '#e0e7ef' }}
                            >
                                <h4 className="mb-2 font-medium text-[#64748b]">
                                    Whale Migration Patterns
                                </h4>
                                <p className="mb-3 text-sm text-[#94a3b8]">
                                    Tracking data reveals new migration routes in response to
                                    changing ocean temperatures.
                                </p>
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    className="border-[#e0e7ef] text-[#64748b] hover:bg-[#e0e7ef] hover:text-[#64748b]"
                                >
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
