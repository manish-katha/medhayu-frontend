
'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, Calendar, DollarSign, FileHeart, Pin, PinOff, X, Plus, ChevronDown, ShoppingCart, Receipt, Sparkles, TrendingUp, Package, BarChart as BarChartIcon, AlertCircle, Database } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import { Skeleton } from '@/components/ui/skeleton';
import GridLayout, { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import BillingPage from '@/app/erp/billing/page';
import PurchasesPage from '@/app/erp/purchases/page';
import JourneyModal from '@/components/Journey/JourneyModal';
import HealNowButton from '@/components/ui/HealNowButton';
import StatCard from '@/components/Dashboard/StatCard';
import { useToast } from '@/hooks/use-toast';
import { testDbConnection } from '@/actions/test.actions';


const ResponsiveGridLayout = WidthProvider(Responsive);

const chartData = [
  { month: "Jan", consultations: 186, revenue: 42000 },
  { month: "Feb", consultations: 305, revenue: 45000 },
  { month: "Mar", consultations: 237, revenue: 52000 },
  { month: "Apr", consultations: 273, revenue: 58000 },
  { month: "May", consultations: 209, revenue: 55000 },
  { month: "Jun", consultations: 62000, revenue: 62000 },
];

const erpChartData = [
  { month: 'Jan', revenue: 42000, profit: 18000 },
  { month: 'Feb', revenue: 45000, profit: 20000 },
  { month: 'Mar', revenue: 52000, profit: 24000 },
  { month: 'Apr', revenue: 58000, profit: 27000 },
  { month: 'May', revenue: 55000, profit: 25000 },
  { month: 'Jun', revenue: 62000, profit: 30000 },
];


const recentAppointments = [
  { name: 'Rohan Sharma', time: '10:00 AM', status: 'Confirmed' },
  { name: 'Priya Patel', time: '10:30 AM', status: 'Pending' },
  { name: 'Amit Singh', time: '11:00 AM', status: 'Confirmed' },
  { name: 'Sneha Reddy', time: '11:30 AM', status: 'Cancelled' },
  { name: 'Vikram Mehta', time: '12:00 PM', status: 'Confirmed' },
]

const patientDemographicsData = [
  { name: '0-18', value: 40 },
  { name: '19-35', value: 120 },
  { name: '36-50', value: 90 },
  { name: '51-65', value: 70 },
  { name: '65+', value: 50 },
];

const conditionPrevalenceData = [
  { name: 'Arthritis', value: 80 },
  { name: 'Diabetes', value: 65 },
  { name: 'Skin Issues', value: 50 },
  { name: 'Digestive', value: 45 },
  { name: 'Respiratory', value: 30 },
  { name: 'Other', value: 70 },
];

const topSellingProducts = [
    { name: 'Ashwagandha Churna', unitsSold: 125, revenue: 31250 },
    { name: 'Triphala Guggulu', unitsSold: 98, revenue: 29400 },
    { name: 'Mahanarayan Oil', unitsSold: 75, revenue: 33750 },
    { name: 'Oshadham Immunity Booster', unitsSold: 60, revenue: 36000 },
];


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

const defaultLayouts: { [key: string]: Layout[] } = {
    lg: [
        // Clinical Stats
        { i: 'stat-appointments', x: 0, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-patients', x: 2, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-cases', x: 4, y: 0, w: 2, h: 2, isResizable: true },
        
        // ERP Stats
        { i: 'stat-revenue', x: 6, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-profit', x: 8, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-orders', x: 10, y: 0, w: 2, h: 2, isResizable: true },

        // Charts & Info
        { i: 'consultations', x: 0, y: 2, w: 6, h: 4, isResizable: true },
        { i: 'sales-overview', x: 6, y: 2, w: 6, h: 4, isResizable: true },
        
        // Lists & Tables
        { i: 'appointments', x: 0, y: 6, w: 4, h: 5, isResizable: true },
        { i: 'recent-invoices', x: 4, y: 6, w: 4, h: 5, isResizable: true },
        { i: 'recent-purchases', x: 8, y: 6, w: 4, h: 5, isResizable: true },
        
        // Other stats and pies
        { i: 'stat-inventory', x: 0, y: 11, w: 2, h: 2, isResizable: true },
        { i: 'stat-pending-payments', x: 2, y: 11, w: 2, h: 2, isResizable: true },
        { i: 'stat-low-stock', x: 4, y: 11, w: 2, h: 2, isResizable: true },
        
        { i: 'demographics', x: 6, y: 11, w: 3, h: 4, isResizable: true },
        { i: 'prevalence', x: 9, y: 11, w: 3, h: 4, isResizable: true },
        
        { i: 'weather', x: 0, y: 15, w: 4, h: 4, isResizable: true },
        { i: 'top-selling', x: 4, y: 15, w: 4, h: 4, isResizable: true },
        { i: 'heal-now', x: 8, y: 15, w: 4, h: 4, isResizable: true },
    ],
};

const SalesOverviewChart = () => (
     <Card className="h-full w-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon size={18} />
            Sales Overview
          </CardTitle>
          <CardDescription>Monthly revenue and profit analysis</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={erpChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} tickFormatter={(value) => `₹${Number(value)/1000}k`} />
              <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
              <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="hsl(var(--chart-1))" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
);

const allWidgets = {
    // Clinical Widgets
    'stat-appointments': { w: 2, h: 2, content: () => <StatCard title="Today's Appointments" value="12" icon={<Calendar size={20} />} description="+2 since yesterday" chartData={chartData} chartKey="consultations" />, name: "Today's Appointments" },
    'stat-patients': { w: 2, h: 2, content: () => <StatCard title="New Patients" value="+23" icon={<Users size={20} />} description="+5 this month" />, name: "New Patients" },
    'consultations': { w: 8, h: 4, content: () => <ConsultationsCard />, name: "Consultations Overview" },
    'weather': { w: 4, h: 4, content: () => <WeatherWidget className="h-full w-full" />, name: "Weather" },
    'appointments': { w: 6, h: 4, content: () => <AppointmentsTableCard />, name: "Today's Appointments List" },
    'demographics': { w: 3, h: 4, content: () => <DemographicsCard />, name: "Patient Demographics" },
    'prevalence': { w: 3, h: 4, content: () => <PrevalenceCard />, name: "Condition Prevalence" },
    'heal-now': { w: 2, h: 5, content: () => <HealNowWidget />, name: "Start Healing Journey" },
    'stat-cases': { w: 2, h: 2, content: () => <StatCard title="Case Studies" value="15" icon={<FileHeart size={20} />} description="+3 this month" />, name: "Case Studies" },

    // ERP Widgets
    'stat-revenue': { w: 2, h: 2, content: () => <StatCard title="Total Revenue" value="₹1,25,430" icon={<DollarSign size={20} />} trend={{ value: 12.5, positive: true }} chartData={erpChartData} chartKey="revenue" />, name: 'Total Revenue' },
    'stat-profit': { w: 2, h: 2, content: () => <StatCard title="Total Profit" value="₹45,210" icon={<TrendingUp size={20} />} trend={{ value: 8.2, positive: true }} chartData={erpChartData} chartKey="profit" />, name: 'Total Profit' },
    'stat-inventory': { w: 2, h: 2, content: () => <StatCard title="Inventory Value" value="₹2,80,970" icon={<Package size={20} />} trend={{ value: 2.3, positive: false }} />, name: 'Inventory Value' },
    'stat-pending-payments': { w: 2, h: 2, content: () => <StatCard title="Pending Payments" value="₹22,800" icon={<DollarSign size={20} />} description="from 8 invoices" />, name: 'Pending Payments' },
    'recent-invoices': { w: 6, h: 5, content: () => <RecentInvoicesWidget />, name: 'Recent Invoices' },
    'recent-purchases': { w: 6, h: 5, content: () => <RecentPurchasesWidget />, name: 'Recent Purchases' },
    'top-selling': { w: 4, h: 5, content: () => <TopSellingProductsWidget />, name: 'Top Selling Products' },
    
    // Adding from ERP
    'sales-overview': { w: 8, h: 4, content: () => <SalesOverviewChart />, name: 'Sales Overview' },
    'stat-orders': { w: 2, h: 2, content: () => <StatCard title="Total Orders" value="345" icon={<ShoppingCart size={20} />} trend={{ value: 5.1, positive: true }} />, name: 'Total Orders' },
    'stat-low-stock': { w: 2, h: 2, content: () => <StatCard title="Low Stock Items" value="12" icon={<AlertCircle size={20} />} description="vs 15 last week" />, name: 'Low Stock Items' },
};

const ConsultationsCard = () => (
    <Card className="h-full w-full flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline text-lg md:text-xl">Consultations Overview</CardTitle>
            <CardDescription>A summary of patient consultations over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2 flex-grow">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                />
                <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                />
                <Bar dataKey="consultations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

const AppointmentsTableCard = () => (
    <Card className="h-full w-full flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline text-lg md:text-xl">Today's Appointments</CardTitle>
            <CardDescription>
            You have {recentAppointments.length} appointments today.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead className="hidden sm:table-cell">Time</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentAppointments.map((appointment) => (
                    <TableRow key={appointment.name}>
                        <TableCell className="font-medium text-xs sm:text-sm">{appointment.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{appointment.time}</TableCell>
                        <TableCell className="text-right">
                        <Badge variant={appointment.status === 'Confirmed' ? 'default' : appointment.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                            {appointment.status}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </ScrollArea>
        </CardContent>
    </Card>
);

const DemographicsCard = () => (
    <Card className="h-full w-full flex flex-col">
    <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
        <Users size={18} /> Patient Age Demographics
        </CardTitle>
        <CardDescription>Distribution of patients by age group.</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie data={patientDemographicsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={'80%'} label>
            {patientDemographicsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            </Pie>
            <Tooltip
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
            }}
            />
        </PieChart>
        </ResponsiveContainer>
    </CardContent>
    </Card>
);

const PrevalenceCard = () => (
    <Card className="h-full w-full flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Activity size={18} /> Condition Prevalence
            </CardTitle>
            <CardDescription>Most common conditions treated.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={conditionPrevalenceData} margin={{ right: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={10}/>
                <YAxis type="category" dataKey="name" width={80} fontSize={10} tick={{width: 70, textAnchor: 'start'}}/>
                <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" name="Number of Cases" />
            </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

const RecentInvoicesWidget = () => (
    <Card className="h-full w-full flex flex-col">
        <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
            <BillingPage isEmbedded />
        </CardContent>
    </Card>
);

const RecentPurchasesWidget = () => (
    <Card className="h-full w-full flex flex-col">
        <CardHeader><CardTitle>Recent Purchases</CardTitle></CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
            <PurchasesPage isEmbedded />
        </CardContent>
    </Card>
);

const TopSellingProductsWidget = () => (
    <Card className="h-full w-full flex flex-col">
        <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By units sold this month</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topSellingProducts.map(p => (
                        <TableRow key={p.name}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell className="text-right">{p.unitsSold}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const HealNowWidget = () => {
    const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
    return (
        <>
            <HealNowButton onClick={() => setIsJourneyModalOpen(true)} className="h-full w-full" />
            <JourneyModal isOpen={isJourneyModalOpen} onOpenChange={setIsJourneyModalOpen} />
        </>
    );
};

const DashboardPageContent = () => {
    const { toast } = useToast();
    const [layouts, setLayouts] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedLayout = localStorage.getItem('dashboardLayouts');
            if (savedLayout) {
                return JSON.parse(savedLayout);
            }
        }
        return defaultLayouts;
    });

    const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
         if (typeof window !== 'undefined') {
            const savedWidgets = localStorage.getItem('dashboardWidgets');
            if (savedWidgets) {
                return JSON.parse(savedWidgets);
            }
        }
        return Object.keys(allWidgets);
    });
    
    const [dbState, dbFormAction] = useActionState(testDbConnection, null);
    console.log("ddddd",dbState);

    useEffect(() => {
        if(dbState?.success) {
            toast({ title: "Success!", description: "Database connection successful."});
        }
        if(dbState?.error) {
            toast({ title: "Database Error", description: dbState.error, variant: 'destructive'});
        }
    }, [dbState, toast]);
 const [state, runTest, isPending] = useActionState(testDbConnection, null);
 

console.log("state", state);        // The last returned server value
console.log("runTest", runTest);    // Function to call
console.log("isPending", isPending);// Boolean


    const onLayoutChange = (_: Layout[], newLayouts: { [key: string]: Layout[] }) => {
        setLayouts(newLayouts);
        localStorage.setItem('dashboardLayouts', JSON.stringify(newLayouts));
    };
    
    const togglePin = (widgetId: string) => {
        const newLayouts = JSON.parse(JSON.stringify(layouts)); // Deep copy
        Object.keys(newLayouts).forEach(breakpoint => {
            const item = newLayouts[breakpoint].find((l: any) => l.i === widgetId);
            if(item) {
                item.static = !item.static;
            }
        });
        setLayouts(newLayouts);
        localStorage.setItem('dashboardLayouts', JSON.stringify(newLayouts));
    }
    
    const removeWidget = (widgetId: string) => {
        const newWidgets = activeWidgets.filter(id => id !== widgetId);
        setActiveWidgets(newWidgets);
        localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
    };

    const addWidget = (widgetId: string) => {
        if (activeWidgets.includes(widgetId)) return;
        const newWidgets = [...activeWidgets, widgetId];
        setActiveWidgets(newWidgets);
        
        // Add layout for the new widget
        const newLayouts = JSON.parse(JSON.stringify(layouts));
        const widgetConfig = (allWidgets as any)[widgetId];

        Object.keys(newLayouts).forEach(breakpoint => {
            const maxY = Math.max(0, ...newLayouts[breakpoint].map((l: Layout) => l.y + l.h));
            newLayouts[breakpoint].push({
                i: widgetId,
                x: 0,
                y: maxY,
                w: widgetConfig.w,
                h: widgetConfig.h,
                isResizable: true,
            });
        });
        setLayouts(newLayouts);
    }
    
    const availableWidgets = Object.keys(allWidgets).filter(id => !activeWidgets.includes(id));
    
    const WidgetMenu = ({ widgetId }: { widgetId: string }) => {
        const isStatic = layouts.lg?.find((l: any) => l.i === widgetId)?.static || false;
        
        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10 opacity-50 hover:opacity-100">
                        <Pin size={14} className={cn("text-muted-foreground", isStatic && "text-primary fill-primary")} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => togglePin(widgetId)}>
                        {isStatic ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                        <span>{isStatic ? 'Unpin Widget' : 'Pin Widget'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => removeWidget(widgetId)} className="text-destructive">
                        <X className="mr-2 h-4 w-4" />
                        <span>Remove Widget</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
  return (
    <div>
     <div className="flex justify-end mb-4 gap-2">
         <form action={dbFormAction}>
            <Button variant="outline" type="submit">
                <Database className="mr-2 h-4 w-4" />
                Test DB Connection
            </Button>
         </form>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Widget <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {availableWidgets.length > 0 ? availableWidgets.map(id => (
                    <DropdownMenuItem key={id} onClick={() => addWidget(id)}>
                       {(allWidgets as any)[id].name}
                    </DropdownMenuItem>
                )) : (
                    <DropdownMenuItem disabled>All widgets are currently displayed</DropdownMenuItem>
                )}
            </DropdownMenuContent>
         </DropdownMenu>
     </div>

    <ResponsiveGridLayout 
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={40}
        compactType="vertical"
        isDraggable={true}
        isResizable={true}
        preventCollision={false}
        margin={[16, 16]}
    >
         {activeWidgets.map(id => {
            // Check if the widget exists before rendering
            if (!allWidgets[id as keyof typeof allWidgets]) {
                return null;
            }
            return (
                <div key={id} className="relative">
                    <WidgetMenu widgetId={id} />
                    {(allWidgets as any)[id].content()}
                </div>
            )
         })}
    </ResponsiveGridLayout>
    </div>
  );
}

export default function DashboardPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                  </div>
                  <Skeleton className="h-96" />
                </div>
                <div className="xl:col-span-1 space-y-6">
                  <Skeleton className="h-48" />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </div>
            </div>
        )
    }

    return <DashboardPageContent />;
}
