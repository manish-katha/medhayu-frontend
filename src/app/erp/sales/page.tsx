
'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SalesInvoiceForm } from '@/components/ERP/SalesInvoiceForm';
import SalesReturnForm from '@/components/ERP/SalesReturnForm';

const SalesPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales</h1>
      
      <Tabs defaultValue="invoice">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="invoice">Sales Invoice</TabsTrigger>
          <TabsTrigger value="sales-return">Sales Return</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice">
          <SalesInvoiceForm />
        </TabsContent>
        
        <TabsContent value="sales-return">
          <SalesReturnForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesPage;
