
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Grid, List, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getInvoices, getPurchaseOrders, getSalesReturns } from '@/services/erp.service';
import { Invoice, PurchaseOrder, SalesReturn } from '@/types/erp';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type DocumentType = 'invoice' | 'po' | 'return';

const DocumentCard = ({ doc, type }: { doc: any, type: DocumentType }) => {
    let title, id, date, amount, status, statusVariant;

    switch (type) {
        case 'invoice':
            title = `Invoice to ${doc.patientId}`; // In real app, fetch patient name
            id = doc.invoiceNumber;
            date = doc.date;
            amount = doc.totalAmount;
            status = doc.status;
            statusVariant = status === 'Paid' ? 'success' : status === 'Pending' ? 'warning' : 'destructive';
            break;
        case 'po':
            title = `PO to ${doc.vendorId}`; // In real app, fetch vendor name
            id = doc.poNumber;
            date = doc.date;
            status = doc.status;
            statusVariant = status === 'Completed' ? 'success' : status === 'Sent' ? 'info' : 'default';
            break;
        case 'return':
            title = `Return from ${doc.patientId}`; // In real app, fetch patient name
            id = doc.id;
            date = doc.returnDate;
            status = 'Processed';
            statusVariant = 'success';
            break;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{id}</CardTitle>
                <CardDescription>{title}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Date: {format(new Date(date), 'PPP')}</p>
                {amount && <p className="text-sm font-semibold">Amount: ₹{amount.toLocaleString()}</p>}
                <Badge variant={statusVariant} className="mt-2">{status}</Badge>
            </CardContent>
        </Card>
    );
}


const DocumentsPage = () => {
    const [view, setView] = useState<'grid' | 'list'>('list');
    const [activeTab, setActiveTab] = useState('invoices');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            setIsLoading(true);
            const [inv, po, ret] = await Promise.all([
                getInvoices(),
                getPurchaseOrders(),
                getSalesReturns(),
            ]);
            setInvoices(inv);
            setPurchaseOrders(po);
            setSalesReturns(ret);
            setIsLoading(false);
        }
        fetchDocs();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-2 mt-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            )
        }

        let data: any[] = [];
        let type: DocumentType = 'invoice';
        switch (activeTab) {
            case 'invoices': data = invoices; type = 'invoice'; break;
            case 'pos': data = purchaseOrders; type = 'po'; break;
            case 'returns': data = salesReturns; type = 'return'; break;
        }

        if (view === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                    {data.map(doc => <DocumentCard key={doc.id} doc={doc} type={type} />)}
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map(doc => (
                        <TableRow key={doc.id}>
                            <TableCell>{doc.invoiceNumber}</TableCell>
                            <TableCell>{format(new Date(doc.date), 'PPP')}</TableCell>
                            <TableCell>Sales Invoice</TableCell>
                            <TableCell><Badge variant={doc.status === 'Paid' ? 'success' : doc.status === 'Pending' ? 'warning' : 'destructive'}>{doc.status}</Badge></TableCell>
                            <TableCell className="text-right"><Button variant="outline" size="sm">View</Button></TableCell>
                        </TableRow>
                    ))}
                    {purchaseOrders.map(doc => (
                        <TableRow key={doc.id}>
                            <TableCell>{doc.poNumber}</TableCell>
                            <TableCell>{format(new Date(doc.date), 'PPP')}</TableCell>
                            <TableCell>Purchase Order</TableCell>
                            <TableCell><Badge variant={doc.status === 'Completed' ? 'success' : doc.status === 'Sent' ? 'info' : 'default'}>{doc.status}</Badge></TableCell>
                            <TableCell className="text-right"><Button variant="outline" size="sm">View</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Documents</h1>
                    <p className="text-muted-foreground">View all your sales and purchase documents.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search documents..." className="pl-8" />
                    </div>
                     <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                        <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                            <Grid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="all">All Documents</TabsTrigger>
                            <TabsTrigger value="invoices">Sales Invoices</TabsTrigger>
                            <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
                            <TabsTrigger value="returns">Sales Returns</TabsTrigger>
                            <TabsTrigger value="bills">Purchase Bills</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}

export default DocumentsPage;
