
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet } from 'lucide-react';
import { format } from 'date-fns';

const mockTransactions = [
  { id: 'txn_1', date: new Date(), type: 'deposit', description: 'Added funds via UPI', amount: 5000 },
  { id: 'txn_2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: 'withdrawal', description: 'Purchase Order #PO-1234', amount: -1500 },
  { id: 'txn_3', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: 'deposit', description: 'Added funds via Card', amount: 2000 },
  { id: 'txn_4', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), type: 'withdrawal', description: 'Purchase Order #PO-1221', amount: -3200 },
];

const WalletPage = () => {
  const currentBalance = mockTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <p className="text-muted-foreground">Manage your balance for marketplace purchases.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Funds
        </Button>
      </div>

      <Card className="w-full max-w-md bg-gradient-to-r from-ayurveda-green to-ayurveda-ochre text-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={24} />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold tracking-tight">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <CardDescription className="text-white/80 mt-1">
            Available for purchases in the marketplace.
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A record of all your wallet activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(tx.date, 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'deposit' ? 'success' : 'destructive'} className="capitalize">
                      {tx.type === 'deposit' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownLeft className="mr-1 h-3 w-3" />}
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
