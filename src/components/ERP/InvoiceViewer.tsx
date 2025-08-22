
import React from 'react';
import { Invoice } from '@/types/patient-profile';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Building, Phone, Mail } from 'lucide-react';

interface InvoiceViewerProps {
  invoice: Invoice;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoice }) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * 0.18; // Assuming a flat 18% GST for demo
  const total = subtotal + taxAmount;

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-ayurveda-green/10 rounded-full">
                    <Building className="h-6 w-6 text-ayurveda-green" />
                </div>
                <h1 className="text-2xl font-bold text-ayurveda-brown">Oshadham Ayurveda</h1>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
                <p>123 Healing Path, Ayurveda Nagar</p>
                <p>Bangalore, Karnataka, 560001</p>
                <p>India</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-ayurveda-green uppercase tracking-wider">Invoice</h2>
            <p className="text-muted-foreground mt-1">{invoice.id}</p>
            <p className="text-sm text-muted-foreground">Date: {new Date(invoice.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-500 mb-2">Bill To:</h3>
          <p className="font-medium text-gray-800">Rajesh Kumar</p>
          <p className="text-sm text-muted-foreground">123, Vasant Vihar, New Delhi</p>
          <p className="text-sm text-muted-foreground">rajesh.kumar@example.com</p>
        </div>

        {/* Items Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-ayurveda-green/5">
              <TableHead className="w-[50%]">Item Description</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">₹{item.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">₹{item.total.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Totals Section */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (18%)</span>
              <span className="font-medium">₹{taxAmount.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span className="text-ayurveda-green">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-xs text-muted-foreground">
          <div>Thank you for your business!</div>
          <div className="mt-1">
            <span className="flex items-center justify-center gap-2">
                <Phone size={12} /> +91 80 2345 6789 <Separator orientation="vertical" className="h-3"/> <Mail size={12} /> info@oshadham.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewer;
