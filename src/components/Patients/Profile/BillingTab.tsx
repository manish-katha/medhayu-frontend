

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Invoice as InvoiceType } from '@/types/patient-profile';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import InvoiceViewer from '@/components/ERP/InvoiceViewer';
import { getInvoices } from '@/services/erp.service';

interface BillingTabProps {
  patientId: string;
}

const BillingTab: React.FC<BillingTabProps> = ({ patientId }) => {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
        const allInvoices = await getInvoices();
        const patientInvoices = allInvoices
            .filter(i => i.patientId.toString() === patientId.toString())
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setInvoices(patientInvoices);
    }
    fetchInvoices();
  }, [patientId]);

  // Temporary function to mock invoice items for viewer
  const mockInvoiceForViewer = (invoice: InvoiceType): any => {
      return {
          id: invoice.id,
          date: invoice.date,
          items: invoice.items.map((item, index) => ({
              id: `item-${index}`,
              name: item.name,
              quantity: item.qty,
              price: item.price,
              total: item.qty * item.price
          }))
      }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{format(new Date(invoice.date), 'dd MMM, yyyy')}</TableCell>
                  <TableCell>₹{invoice.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === 'Paid' ? 'success' :
                        invoice.status === 'Pending' ? 'warning' : 'destructive'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>View Invoice</Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No invoices found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={(isOpen) => !isOpen && setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Viewing invoice {selectedInvoice?.invoiceNumber} from {selectedInvoice ? format(new Date(selectedInvoice.date), 'PPP') : ''}.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && <InvoiceViewer invoice={mockInvoiceForViewer(selectedInvoice)} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillingTab;
