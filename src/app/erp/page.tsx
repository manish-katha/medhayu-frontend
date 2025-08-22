
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, BarChart as BarChartIcon, Plus, ChevronDown, Pin, PinOff, X, AlertCircle } from 'lucide-react';
import StatCard from '@/components/Dashboard/StatCard';
import WelcomeBanner from '@/components/Dashboard/WelcomeBanner';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GridLayout, { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import BillingPage from '@/app/erp/billing/page';
import PurchasesPage from '@/app/erp/purchases/page';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ResponsiveGridLayout = WidthProvider(Responsive);

const erpChartData = [
  { month: 'Jan', revenue: 42000, profit: 18000 },
  { month: 'Feb', revenue: 45000, profit: 20000 },
  { month: 'Mar', revenue: 52000, profit: 24000 },
  { month: 'Apr', revenue: 58000, profit: 27000 },
  { month: 'May', revenue: 55000, profit: 25000 },
  { month: 'Jun', revenue: 62000, profit: 30000 },
];

const topSellingProducts = [
    { name: 'Ashwagandha Churna', unitsSold: 125, revenue: 31250 },
    { name: 'Triphala Guggulu', unitsSold: 98, revenue: 29400 },
    { name: 'Mahanarayan Oil', unitsSold: 75, revenue: 33750 },
    { name: 'Oshadham Immunity Booster', unitsSold: 60, revenue: 36000 },
];

const allErpWidgets = {
    'stat-revenue': { w: 2, h: 2, content: () => <StatCard title="Total Revenue" value="₹1,25,430" icon={<DollarSign size={20} />} trend={{ value: 12.5, positive: true }} />, name: 'Total Revenue' },
    'stat-profit': { w: 2, h: 2, content: () => <StatCard title="Total Profit" value="₹45,210" icon={<TrendingUp size={20} />} trend={{ value: 8.2, positive: true }} />, name: 'Total Profit' },
    'stat-orders': { w: 2, h: 2, content: () => <StatCard title="Total Orders" value="345" icon={<ShoppingCart size={20} />} trend={{ value: 5.1, positive: true }} />, name: 'Total Orders' },
    'stat-inventory': { w: 2, h: 2, content: () => <StatCard title="Inventory Value" value="₹2,80,970" icon={<Package size={20} />} trend={{ value: 2.3, positive: false }} />, name: 'Inventory Value' },
    'stat-low-stock': { w: 2, h: 2, content: () => <StatCard title="Low Stock Items" value="12" icon={<AlertCircle size={20} />} description="vs 15 last week" />, name: 'Low Stock Items' },
    'stat-pending-payments': { w: 2, h: 2, content: () => <StatCard title="Pending Payments" value="₹22,800" icon={<DollarSign size={20} />} description="from 8 invoices" />, name: 'Pending Payments' },
    'sales-overview': { w: 8, h: 4, content: () => <SalesOverviewChart />, name: 'Sales Overview' },
    'recent-invoices': { w: 6, h: 5, content: () => <RecentInvoicesWidget />, name: 'Recent Invoices' },
    'recent-purchases': { w: 6, h: 5, content: () => <RecentPurchasesWidget />, name: 'Recent Purchases' },
    'top-selling': { w: 4, h: 5, content: () => <TopSellingProductsWidget />, name: 'Top Selling Products' },
};

const defaultLayouts: { [key: string]: Layout[] } = {
    lg: [
        { i: 'stat-revenue', x: 0, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-profit', x: 2, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-orders', x: 4, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-inventory', x: 6, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-low-stock', x: 8, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'stat-pending-payments', x: 10, y: 0, w: 2, h: 2, isResizable: true },
        { i: 'sales-overview', x: 0, y: 2, w: 8, h: 4, isResizable: true },
        { i: 'top-selling', x: 8, y: 2, w: 4, h: 4, isResizable: true },
        { i: 'recent-invoices', x: 0, y: 6, w: 6, h: 5, isResizable: true },
        { i: 'recent-purchases', x: 6, y: 6, w: 6, h: 5, isResizable: true },
    ]
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
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
              <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue (₹)" />
              <Bar dataKey="profit" fill="hsl(var(--chart-1))" name="Profit (₹)" />
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


const ERPDashboardPage = () => {
    const [layouts, setLayouts] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedLayout = localStorage.getItem('erpDashboardLayouts');
            if (savedLayout) return JSON.parse(savedLayout);
        }
        return defaultLayouts;
    });

    const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
         if (typeof window !== 'undefined') {
            const savedWidgets = localStorage.getItem('erpDashboardWidgets');
            if (savedWidgets) return JSON.parse(savedWidgets);
        }
        return defaultLayouts.lg.map(l => l.i);
    });

    const onLayoutChange = (_: Layout[], newLayouts: { [key: string]: Layout[] }) => {
        setLayouts(newLayouts);
        localStorage.setItem('erpDashboardLayouts', JSON.stringify(newLayouts));
    };

    const togglePin = (widgetId: string) => {
        const newLayouts = JSON.parse(JSON.stringify(layouts));
        Object.keys(newLayouts).forEach(breakpoint => {
            const item = newLayouts[breakpoint].find((l: any) => l.i === widgetId);
            if(item) item.static = !item.static;
        });
        setLayouts(newLayouts);
    }
    
    const removeWidget = (widgetId: string) => {
        const newWidgets = activeWidgets.filter(id => id !== widgetId);
        setActiveWidgets(newWidgets);
        localStorage.setItem('erpDashboardWidgets', JSON.stringify(newWidgets));
    };

    const addWidget = (widgetId: string) => {
        if (activeWidgets.includes(widgetId)) return;
        const newWidgets = [...activeWidgets, widgetId];
        setActiveWidgets(newWidgets);
        
        const newLayouts = JSON.parse(JSON.stringify(layouts));
        const widgetConfig = (allErpWidgets as any)[widgetId];
        Object.keys(newLayouts).forEach(breakpoint => {
            const maxY = Math.max(0, ...newLayouts[breakpoint].map((l: Layout) => l.y + l.h));
            newLayouts[breakpoint].push({ i: widgetId, x: 0, y: maxY, ...widgetConfig });
        });
        setLayouts(newLayouts);
    }
    
    const availableWidgets = Object.keys(allErpWidgets).filter(id => !activeWidgets.includes(id));

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
                        <span>{isStatic ? 'Unpin' : 'Pin'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => removeWidget(widgetId)} className="text-destructive">
                        <X className="mr-2 h-4 w-4" /> Remove
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
  return (
    <div className="space-y-6">
      <WelcomeBanner doctorName="ERP Manager" />
      
       <div className="flex justify-end mb-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Widget <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {availableWidgets.length > 0 ? availableWidgets.map(id => (
                        <DropdownMenuItem key={id} onClick={() => addWidget(id)}>
                           {(allErpWidgets as any)[id].name}
                        </DropdownMenuItem>
                    )) : (
                        <DropdownMenuItem disabled>All widgets displayed</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
             </DropdownMenu>
        </div>

        <ResponsiveGridLayout 
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={80}
            compactType="vertical"
            isDraggable={true}
            isResizable={true}
            preventCollision={false}
            margin={[16, 16]}
        >
             {activeWidgets.map(id => (
                <div key={id} className="relative">
                    <WidgetMenu widgetId={id} />
                    {(allErpWidgets as any)[id].content()}
                </div>
            ))}
        </ResponsiveGridLayout>
    </div>
  );
};

export default ERPDashboardPage;
