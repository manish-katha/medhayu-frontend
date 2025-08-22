
import React from 'react';
import { PurchaseOrder } from '@/types/erp';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Building, Phone, Mail, Truck, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface PurchaseOrderViewerProps {
  purchaseOrder: PurchaseOrder;
}

const PurchaseOrderViewer: React.FC<PurchaseOrderViewerProps> = ({ purchaseOrder }) => {
  const subtotal = purchaseOrder.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const totalGst = purchaseOrder.items.reduce((sum, item) => sum + (item.quantity * item.rate * item.gst / 100), 0);
  const total = subtotal + totalGst;

  // Mock data for clinic and vendor details
  const clinicDetails = {
    name: "Oshadham Ayurveda",
    address: "123 Healing Path, Ayurveda Nagar, Bangalore, 560001",
    phone: "+91 80 2345 6789",
    email: "info@oshadham.com",
    gstin: "29ABCDE1234F1Z5"
  };

  const vendorDetails = {
    name: purchaseOrder.vendorName || "Herbal Suppliers Ltd.",
    address: "456 Herb Lane, Green Valley, Pune, 411001",
    phone: "+91 20 9876 5432",
    email: "sales@herbalsuppliers.com",
    gstin: "27FGHIJ5678K1Z3"
  };

  return (
    <div className="p-2 sm:p-6 bg-gray-50 rounded-lg">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm border" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', margin: 'auto' }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-ayurveda-green/10 rounded-full">
                <Building className="h-6 w-6 text-ayurveda-green" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-ayurveda-brown">{clinicDetails.name}</h1>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <p>{clinicDetails.address}</p>
              <p>GSTIN: {clinicDetails.gstin}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl sm:text-3xl font-bold text-ayurveda-green uppercase tracking-wider">Purchase Order</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-all">{purchaseOrder.poNumber}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Date: {format(new Date(purchaseOrder.date), 'PPP')}</p>
          </div>
        </div>

        {/* Vendor & Shipping Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-500 mb-2 border-b pb-1">Vendor</h3>
            <p className="font-medium text-gray-800">{vendorDetails.name}</p>
            <p className="text-sm text-muted-foreground">{vendorDetails.address}</p>
            <p className="text-sm text-muted-foreground">GSTIN: {vendorDetails.gstin}</p>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Mail size={12} className="mr-1" /> {vendorDetails.email}
            </div>
             <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Phone size={12} className="mr-1" /> {vendorDetails.phone}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-500 mb-2 border-b pb-1">Ship To</h3>
             <p className="font-medium text-gray-800">{clinicDetails.name}</p>
            <p className="text-sm text-muted-foreground">{clinicDetails.address}</p>
             <div className="flex items-center text-sm text-muted-foreground mt-2">
              <Truck size={12} className="mr-1" /> Expected Delivery: {format(new Date(purchaseOrder.expectedDate), 'PPP')}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-ayurveda-green/5">
              <TableHead className="w-[40%]">Item</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrder.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {item.itemName}
                  {item.itemDescription && <p className="text-xs text-muted-foreground">{item.itemDescription}</p>}
                </TableCell>
                <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                <TableCell className="text-right">₹{item.rate.toFixed(2)}</TableCell>
                 <TableCell className="text-right">{item.gst}%</TableCell>
                <TableCell className="text-right">₹{(item.quantity * item.rate).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Totals Section */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total GST</span>
              <span className="font-medium">₹{totalGst.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span className="text-ayurveda-green">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Terms and Signature */}
         <div className="mt-auto pt-8">
            {purchaseOrder.terms && (
                <div className="mb-8">
                    <h4 className="font-semibold text-sm mb-1">Terms & Conditions</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{purchaseOrder.terms}</p>
                </div>
            )}
            <div className="text-right">
                <div className="w-48 h-16 border-b inline-block"></div>
                <p className="text-sm">Authorized Signature</p>
            </div>
         </div>

      </div>
    </div>
  );
};

export default PurchaseOrderViewer;
