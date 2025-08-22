
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Grid, List, Plus, Search, Upload, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getPurchaseOrders, getPurchaseBills } from '@/services/erp.service';
import { PurchaseOrder, PurchaseBill } from '@/types/erp';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { deletePurchaseOrder } from '@/actions/erp.actions';
import DeleteConfirmationDialog from '@/components/Patients/Profile/DeleteConfirmationDialog';
import PurchaseOrderForm from '@/components/ERP/PurchaseOrderForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import PurchaseBillForm from '@/components/ERP/PurchaseBillForm';
import PurchaseOrderViewer from '@/components/ERP/PurchaseOrderViewer';
import { extractPurchaseBillData, ExtractedBillData } from '@/ai/flows/extract-purchase-bill-data';
import ReportPreview from '@/components/Patients/Profile/ReportPreview';
import { mockPurchaseBillText } from '@/data/mock-purchase-bill-text';

const PurchaseOrderCard = ({ po, onView }: { po: PurchaseOrder, onView: (po: PurchaseOrder) => void }) => (
    <Card className="cursor-pointer" onClick={() => onView(po)}>
        <CardHeader>
            <CardTitle className="text-base">{po.poNumber}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm">Vendor ID: {po.vendorId}</p>
            <p className="text-sm text-muted-foreground">Date: {format(new Date(po.date), 'PPP')}</p>
        </CardContent>
    </Card>
);

const UploadBillDialog = ({ onBillParsed }: { onBillParsed: (data: ExtractedBillData) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleProcess = async () => {
        if (!selectedFile) {
            toast({ title: "Please select a file.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        try {
            // In a real app, you would extract text from the PDF.
            // For this demo, we use mock text that resembles the user's bill.
            const result = await extractPurchaseBillData({ billText: mockPurchaseBillText });
            onBillParsed(result);
            setIsOpen(false);
            toast({ title: "Bill Parsed", description: "The purchase bill form has been pre-filled." });
        } catch (error) {
            toast({ title: "Parsing Failed", description: "The AI could not process the bill.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Upload size={16} className="mr-2" />Upload & Parse Bill</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Purchase Bill</DialogTitle>
                    <DialogDescription>
                        Select a PDF bill to have our AI extract the details automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleProcess} disabled={isProcessing || !selectedFile}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Process with AI
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface PurchasesPageProps {
  isEmbedded?: boolean;
}

const PurchasesPage = ({ isEmbedded = false }: PurchasesPageProps) => {
    const [view, setView] = useState<'grid' | 'list'>('list');
    const [activeTab, setActiveTab] = useState('purchase-orders');
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);
    const [poToView, setPoToView] = useState<PurchaseOrder | null>(null);

    // State for the forms
    const [isPoFormOpen, setIsPoFormOpen] = useState(false);
    const [isBillFormOpen, setIsBillFormOpen] = useState(false);
    const [parsedBillData, setParsedBillData] = useState<ExtractedBillData | null>(null);

    const fetchDocs = async () => {
        setIsLoading(true);
        const [po, pb] = await Promise.all([
            getPurchaseOrders(),
            getPurchaseBills(),
        ]);
        setPurchaseOrders(po);
        setPurchaseBills(pb);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleDeleteConfirm = async () => {
        if (!poToDelete) return;
        const result = await deletePurchaseOrder(poToDelete.id);
        if (result.success) {
          toast({
            title: "Purchase Order Deleted",
            description: `PO ${poToDelete.poNumber} has been deleted.`,
          });
          setPoToDelete(null);
          fetchDocs(); // Refresh the list
        } else {
          toast({
            title: "Deletion Failed",
            description: result.error,
            variant: "destructive",
          });
        }
      };
      
    const handleBillParsed = (data: ExtractedBillData) => {
        setParsedBillData(data);
        setIsBillFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsPoFormOpen(false);
        setIsBillFormOpen(false);
        setParsedBillData(null);
        fetchDocs();
    }


    const renderPurchaseOrders = () => {
        if (isLoading) {
             return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                 </div>
            )
        }
         if (purchaseOrders.length === 0) {
            return (
                 <EmptyState
                    icon={<FileText />}
                    title="No Purchase Orders"
                    description="Get started by creating a new purchase order."
                />
            )
        }


        if (view === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                    {purchaseOrders.map(po => <PurchaseOrderCard key={po.id} po={po} onView={setPoToView} />)}
                </div>
            );
        }

        return (
            <div className="mt-4 border rounded-md">
                <table className="w-full">
                <thead><tr className="border-b"><th className="p-2 text-left">PO Number</th><th className="p-2 text-left">Vendor</th><th className="p-2 text-left">Date</th><th className="p-2 text-left">Status</th><th className="p-2 text-right">Actions</th></tr></thead>
                <tbody>
                    {purchaseOrders.map(po => (
                        <tr key={po.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{po.poNumber}</td>
                            <td className="p-2">{po.vendorId}</td>
                            <td className="p-2">{format(new Date(po.date), 'PPP')}</td>
                            <td className="p-2">{po.status}</td>
                            <td className="p-2 text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setPoToView(po)}>View</Button>
                                <Button variant="outline" size="sm" onClick={() => setPoToDelete(po)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )
    };
    
    const renderPurchaseBills = () => {
        if (isLoading) return <Skeleton className="h-64 w-full mt-4" />;
        if (purchaseBills.length === 0) {
            return (
                 <EmptyState
                    icon={<FileText />}
                    title="No Purchase Bills"
                    description="You haven't recorded any purchase bills yet."
                />
            )
        }
        return (
             <div className="mt-4 border rounded-md">
                <table className="w-full">
                <thead><tr className="border-b"><th className="p-2 text-left">Bill Number</th><th className="p-2 text-left">PO Number</th><th className="p-2 text-left">Bill Date</th><th className="p-2 text-right">Actions</th></tr></thead>
                <tbody>
                    {purchaseBills.map(pb => (
                        <tr key={pb.id} className="border-b">
                            <td className="p-2 font-medium">{pb.billNumber}</td>
                            <td className="p-2">{pb.purchaseOrderId}</td>
                            <td className="p-2">{format(new Date(pb.billDate), 'PPP')}</td>
                            <td className="p-2 text-right">
                                <Button variant="outline" size="sm">View</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )
    }

    return (
        <div className="space-y-6">
             <div className={cn("flex justify-between items-center", isEmbedded && "mb-4")}>
                {!isEmbedded && (
                    <div>
                        <h1 className="text-2xl font-bold">Purchases</h1>
                        <p className="text-muted-foreground">Manage your purchase orders and bills.</p>
                    </div>
                )}
                 <div className="flex items-center gap-2">
                    <Button onClick={() => setIsPoFormOpen(true)}><Plus size={16} className="mr-2" />New Purchase Order</Button>
                    <UploadBillDialog onBillParsed={handleBillParsed} />
                    <Button onClick={() => setIsBillFormOpen(true)} variant="outline"><Plus size={16} className="mr-2" />New Purchase Bill</Button>
                </div>
            </div>
            
            <Tabs defaultValue="purchase-orders" className={cn(isEmbedded && "h-full flex flex-col")}>
                <TabsList className={cn(!isEmbedded && "grid w-full grid-cols-2")}>
                    <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
                    <TabsTrigger value="purchase-bills">Purchase Bills</TabsTrigger>
                </TabsList>
                 <TabsContent value="purchase-orders" className={cn(isEmbedded && "flex-grow overflow-hidden")}>
                     <Card className={cn(isEmbedded && "border-none shadow-none h-full flex flex-col")}>
                        <CardHeader className={cn(isEmbedded && "p-0 pb-2")}>
                            <div className="flex justify-between items-center">
                                {!isEmbedded && <CardTitle>All Purchase Orders</CardTitle>}
                                 <div className="flex items-center gap-2 w-full">
                                    <div className="relative flex-grow">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search POs..." className="pl-8 h-9" />
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
                        </CardHeader>
                        <CardContent className={cn(isEmbedded && "p-0 flex-grow overflow-y-auto")}>
                            {renderPurchaseOrders()}
                        </CardContent>
                     </Card>
                </TabsContent>
                <TabsContent value="purchase-bills" className={cn(isEmbedded && "flex-grow overflow-hidden")}>
                    <Card className={cn(isEmbedded && "border-none shadow-none h-full flex flex-col")}>
                        <CardHeader className={cn(isEmbedded && "p-0 pb-2")}><CardTitle>All Purchase Bills</CardTitle></CardHeader>
                        <CardContent className={cn(isEmbedded && "p-0 flex-grow overflow-y-auto")}>
                            {renderPurchaseBills()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             {poToDelete && (
                <DeleteConfirmationDialog
                    isOpen={!!poToDelete}
                    onOpenChange={() => setPoToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                    patientName={`Purchase Order ${poToDelete.poNumber}`}
                />
            )}
             {poToView && (
                <Dialog open={!!poToView} onOpenChange={() => setPoToView(null)}>
                    <DialogContent className="max-w-4xl h-[90vh]">
                         <DialogHeader>
                            <DialogTitle>Purchase Order: {poToView.poNumber}</DialogTitle>
                            <DialogDescription>
                                Issued on {format(new Date(poToView.date), 'PPP')} to {poToView.vendorId}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="overflow-y-auto">
                            <PurchaseOrderViewer purchaseOrder={poToView} />
                        </div>
                    </DialogContent>
                </Dialog>
             )}
             <Dialog open={isPoFormOpen} onOpenChange={setIsPoFormOpen}>
                 <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Create New Purchase Order</DialogTitle>
                        <DialogDescription>Fill out the form to create a new PO for a vendor.</DialogDescription>
                    </DialogHeader>
                    <PurchaseOrderForm onFormSuccess={handleFormSuccess} />
                </DialogContent>
             </Dialog>
             <Dialog open={isBillFormOpen} onOpenChange={() => { setIsBillFormOpen(false); setParsedBillData(null); }}>
                <DialogContent className="max-w-4xl">
                     <DialogHeader>
                        <DialogTitle>Create New Purchase Bill</DialogTitle>
                        <DialogDescription>Record a new bill received from a supplier against a purchase order.</DialogDescription>
                    </DialogHeader>
                    <PurchaseBillForm onFormSuccess={handleFormSuccess} initialData={parsedBillData} />
                </DialogContent>
             </Dialog>
        </div>
    );
}

export default PurchasesPage;
