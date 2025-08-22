
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, Plus, Search, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { SalesInvoiceForm } from '@/components/ERP/SalesInvoiceForm';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { generateGstReport } from '@/actions/erp.actions';
import { useToast } from '@/hooks/use-toast';

const recentInvoices = [
  { id: 'INV-2025-042', patient: 'Rajesh Kumar', date: '2025-05-05', amount: 3500, status: 'Paid' },
  { id: 'INV-2025-041', patient: 'Priya Sharma', date: '2025-05-04', amount: 2800, status: 'Paid' },
  { id: 'INV-2025-040', patient: 'Amit Patel', date: '2025-05-04', amount: 4200, status: 'Pending' },
  { id: 'INV-2025-039', patient: 'Sunita Verma', date: '2025-05-03', amount: 1800, status: 'Paid' },
  { id: 'INV-2025-038', patient: 'Vikram Singh', date: '2025-05-02', amount: 5500, status: 'Overdue' },
];

interface BillingPageProps {
  isEmbedded?: boolean;
}

const GstReportDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    });

    const handleGenerate = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast({ title: "Please select a date range", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateGstReport(dateRange.from, dateRange.to);
            if (result.success && result.csvData) {
                const blob = new Blob([result.csvData], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                const from = format(dateRange.from, 'yyyy-MM-dd');
                const to = format(dateRange.to, 'yyyy-MM-dd');
                link.setAttribute("download", `GST_Report_${from}_to_${to}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({ title: "Report Generated", description: "Your GST report has been downloaded." });
                onOpenChange(false);
            } else {
                toast({ title: "Failed to generate report", description: result.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "An error occurred", description: "Could not generate the report.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate GST Report</DialogTitle>
                    <DialogDescription>
                        Select a date range to generate the GST sales report (GSTR-1).
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Generate & Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const BillingPage = ({ isEmbedded = false }: BillingPageProps) => {
    const [isGstReportOpen, setIsGstReportOpen] = useState(false);

  return (
    <div className={cn(!isEmbedded && "space-y-6")}>
      <div className={cn("flex justify-between items-center", !isEmbedded && "mb-6")}>
        {!isEmbedded && (
          <div>
            <h1 className="text-2xl font-bold">Billing & GST</h1>
            <p className="text-muted-foreground">Manage invoices, payments, and tax filings.</p>
          </div>
        )}
        <div className="flex gap-2 w-full justify-end">
          {isEmbedded ? (
            <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-8 h-9" />
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsGstReportOpen(true)}>
                <FileDown size={14} className="mr-2" />
                Export GST Report
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={14} className="mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <SalesInvoiceForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className={cn(isEmbedded && "border-none shadow-none")}>
        <CardHeader className={cn(isEmbedded && "p-0 pb-4")}>
          <CardTitle>Recent Invoices</CardTitle>
          {!isEmbedded && (
             <CardDescription>A list of the most recent invoices.</CardDescription>
          )}
        </CardHeader>
        <CardContent className={cn(isEmbedded && "p-0")}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.map((invoice) => (
                <TableRow key={invoice.id} className={cn(isEmbedded && "text-xs")}>
                  <TableCell className={cn("font-medium", isEmbedded && "p-2")}>{invoice.id}</TableCell>
                  <TableCell className={cn(isEmbedded && "p-2")}>{invoice.patient}</TableCell>
                  <TableCell className={cn(isEmbedded && "p-2")}>{invoice.date}</TableCell>
                  <TableCell className={cn(isEmbedded && "p-2")}>₹{invoice.amount.toLocaleString()}</TableCell>
                  <TableCell className={cn(isEmbedded && "p-2")}>
                    <Badge 
                      variant={
                        invoice.status === 'Paid' ? 'success' : 
                        invoice.status === 'Pending' ? 'warning' : 'destructive'
                      }
                      className={cn(isEmbedded && "text-xs px-1.5 py-0.5")}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn("text-right", isEmbedded && "p-2")}>
                    <Button variant="outline" size="sm" className={cn(isEmbedded && "h-7 text-xs px-2")}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <GstReportDialog open={isGstReportOpen} onOpenChange={setIsGstReportOpen} />
    </div>
  );
};

export default BillingPage;
