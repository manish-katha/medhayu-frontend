
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Visit, Invoice, LabReport, CaseStudy, PatientData, PatientProfileData } from '@/types/patient-profile';
import { Activity, Clock, BarChart2, Repeat, TrendingUp, DollarSign, FileHeart, Calendar, Stethoscope, Heart, ChevronDown } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, ScatterChart, Scatter, ZAxis } from 'recharts';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import StatCard from './StatCard';
import GridLayout, { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';


const ResponsiveGridLayout = WidthProvider(Responsive);

interface OverviewTabProps {
  profileData: PatientProfileData;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ profileData }) => {
    
    const { patient, visits, invoices, labReports, caseStudies } = profileData;

    const trackedVisits = visits.filter(v => v.trackProgress);
    const uniqueTrackedDiagnoses = [...new Set(trackedVisits.map(v => v.diagnosis))];

    const [trackedConditions, setTrackedConditions] = React.useState<string[]>(uniqueTrackedDiagnoses);
    
    const lastVisit = visits.length > 0 ? new Date(visits[0].date) : null;
    const memberSince = patient.createdAt ? new Date(patient.createdAt) : new Date(); // Fallback
    const lifetimeValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const toggleTrackedCondition = (diagnosis: string) => {
        setTrackedConditions(prev => 
            prev.includes(diagnosis) ? prev.filter(d => d !== diagnosis) : [...prev, diagnosis]
        );
    };

    const allWidgets = React.useMemo(() => {
        const baseWidgets: any = {
            'health-history': { w: 6, h: 4, content: () => <HealthHistoryChart visits={visits} /> },
            'recent-activity': { w: 6, h: 4, content: () => <RecentActivityCard visits={visits} invoices={invoices} /> },
        };

        trackedConditions.forEach(diagnosis => {
            const key = `progress-tracker-${diagnosis.replace(/\s+/g, '-')}`;
            baseWidgets[key] = {
                w: 12, h: 5, content: () => <ProgressTrackerCard diagnosis={diagnosis} visits={visits} labReports={labReports} />
            }
        });

        return baseWidgets;

    }, [visits, invoices, labReports, trackedConditions]);

    const activeWidgetKeys = Object.keys(allWidgets);

    const defaultLayouts: { [key: string]: Layout[] } = {
        lg: [
            { i: 'health-history', x: 0, y: 1, w: 6, h: 4 },
            { i: 'recent-activity', x: 6, y: 1, w: 6, h: 4 },
            ...trackedConditions.map((diagnosis, index) => ({
                i: `progress-tracker-${diagnosis.replace(/\s+/g, '-')}`,
                x: 0,
                y: 5 + (index * 5), // Stagger the trackers
                w: 12,
                h: 5
            }))
        ]
    };
    
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                icon={<Calendar size={20} />} 
                label="Last Visit" 
                value={lastVisit ? format(lastVisit, 'dd MMM, yyyy') : 'N/A'}
                />
                <StatCard 
                icon={<Stethoscope size={20} />} 
                label="Total Visits" 
                value={visits.length}
                />
                <StatCard 
                icon={<DollarSign size={20} />} 
                label="Lifetime Value" 
                value={`₹${lifetimeValue.toLocaleString()}`}
                />
                <StatCard 
                icon={<Heart size={20} />} 
                label="Member Since" 
                value={formatDistanceToNow(memberSince, { addSuffix: true })}
                />
            </div>
            <div className="flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Show Trackers <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Tracked Conditions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {uniqueTrackedDiagnoses.length > 0 ? uniqueTrackedDiagnoses.map(diagnosis => (
                             <DropdownMenuCheckboxItem
                                key={diagnosis}
                                checked={trackedConditions.includes(diagnosis)}
                                onCheckedChange={() => toggleTrackedCondition(diagnosis)}
                            >
                                {diagnosis}
                            </DropdownMenuCheckboxItem>
                        )) : (
                            <DropdownMenuItem disabled>No conditions are being tracked.</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <ResponsiveGridLayout
                layouts={defaultLayouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={80}
                compactType="vertical"
                isDraggable={true}
                isResizable={true}
                margin={[16, 16]}
            >
                {activeWidgetKeys.map(id => (
                    <div key={id}>
                        {(allWidgets as any)[id].content()}
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
};

// Sub-components for widgets
const RecentActivityCard = ({ visits, invoices }: { visits: Visit[], invoices: Invoice[] }) => {
    const recentVisit = visits.length > 0 ? visits[0] : null;
    const recentInvoice = invoices.length > 0 ? invoices[0] : null;
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity size={18} /> Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {recentVisit && (
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Clock size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium">Last Visit: {formatDistanceToNow(new Date(recentVisit.date), { addSuffix: true })}</p>
                                <p className="text-sm text-muted-foreground">{recentVisit.diagnosis}</p>
                            </div>
                        </li>
                    )}
                    {recentInvoice && (
                         <li className="flex items-start gap-4">
                            <div className="bg-green-100 p-2 rounded-full">
                                <Clock size={16} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium">Last Invoice: {recentInvoice.invoiceNumber}</p>
                                <p className="text-sm text-muted-foreground">Amount: ₹{recentInvoice.totalAmount}, Status: {recentInvoice.status}</p>
                            </div>
                        </li>
                    )}
                </ul>
                 {!recentVisit && !recentInvoice && (
                    <p className="text-muted-foreground">No recent activity found.</p>
                )}
            </CardContent>
        </Card>
    );
};

const HealthHistoryChart = ({ visits }: { visits: Visit[] }) => {
    const [layout, setLayout] = React.useState<'vertical' | 'horizontal'>('vertical');
    const visitsByMonth = visits.reduce((acc, visit) => {
        const monthYear = format(new Date(visit.date), 'MMM yyyy');
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(visitsByMonth).map(([name, count]) => ({
        name: name.split(' ')[0],
        count,
    })).sort((a, b) => {
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
    });

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart2 size={18} /> Month-wise Visits
                    </CardTitle>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setLayout(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}>
                        <Repeat size={14} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pl-2 pr-6 h-[80%]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout={layout} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={layout === 'vertical'} vertical={layout === 'horizontal'} />
                        {layout === 'vertical' ? (
                             <>
                                <XAxis type="category" dataKey="name" tick={{fontSize: 12}} />
                                <YAxis type="number" domain={[0, 90]} allowDecimals={false} fontSize={12} />
                            </>
                        ) : (
                             <>
                                <XAxis type="number" domain={[0, 90]} allowDecimals={false} fontSize={12} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={80} 
                                    tick={{fontSize: 12}}
                                    tickLine={false}
                                    axisLine={false}
                                />
                            </>
                        )}
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Bar dataKey="count" name="Visits" fill="hsl(var(--ayurveda-green))" barSize={layout === 'vertical' ? 20 : 15}>
                           <LabelList dataKey="count" position={layout === 'vertical' ? 'top' : 'right'} offset={8} fontSize={12} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                    <EmptyState 
                        icon={<BarChart2 />} 
                        title="No Visit History" 
                        description="This chart will populate as you record patient visits." 
                    />
                </div>
              )}
            </CardContent>
        </Card>
    );
};

const ProgressTrackerCard = ({ diagnosis, visits, labReports }: { diagnosis: string, visits: Visit[], labReports: LabReport[] }) => {
    const trackedVisitDates = visits.filter(v => v.diagnosis === diagnosis).map(v => new Date(v.date));
    if(trackedVisitDates.length === 0) return null;

    const relevantReports = labReports.filter(report => {
        const reportDate = new Date(report.date);
        return reportDate >= Math.min(...trackedVisitDates.map(d => d.getTime())) && reportDate <= Math.max(...trackedVisitDates.map(d => d.getTime()));
    });

    const diagnosisScatterData = relevantReports
        .map(report => {
            const relevantResult = report.results?.find(r => r.testName.toLowerCase().includes('hba1c') || r.testName.toLowerCase().includes('sugar'));
            if (!relevantResult || isNaN(parseFloat(relevantResult.value))) {
                return null;
            }
            return {
                date: new Date(report.date).getTime(),
                value: parseFloat(relevantResult.value),
                name: relevantResult.testName
            };
        })
        .filter((item): item is { date: number; value: number; name: string } => item !== null)
        .sort((a,b) => a.date - b.date);

    return (
         <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={18} /> Progress Tracker: {diagnosis}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[80%]">
                {diagnosisScatterData.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid />
                            <XAxis 
                                type="number" 
                                dataKey="date" 
                                domain={['dataMin', 'dataMax']} 
                                tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM yy')}
                                name="Date"
                            />
                            <YAxis 
                                type="number" 
                                dataKey="value"
                                name={diagnosisScatterData[0]?.name || 'Value'}
                                label={{ value: diagnosisScatterData[0]?.name, angle: -90, position: 'insideLeft' }}
                            />
                            <ZAxis type="category" dataKey="name" name="Test"/>
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                formatter={(value: any, name: any, props: any) => [`${value} (${props.payload.name})`, 'Value']}
                                labelFormatter={(label: any) => format(new Date(label), 'PPP')}
                            />
                            <Scatter name="Lab Results" data={diagnosisScatterData} fill="hsl(var(--ayurveda-terracotta))" />
                        </ScatterChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyState
                        icon={<TrendingUp />}
                        title="Not Enough Data for Progress Chart"
                        description="A progress chart will be shown here when there are at least two relevant lab reports (e.g., HbA1c, Blood Sugar)."
                    />
                )}
            </CardContent>
         </Card>
    );
};


export default OverviewTab;
