
'use client';

import React, { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

interface DynamicPriceCardProps {
  marketRateInfo: {
    baseMetalPrice: number;
    currentPrice: number;
    priceHistory: number[];
  };
}

const DynamicPriceCard: React.FC<DynamicPriceCardProps> = ({ marketRateInfo }) => {
  const [showDialog, setShowDialog] = useState(false);
  
  // Calculate price change percentage
  const lastPrice = marketRateInfo.priceHistory[marketRateInfo.priceHistory.length - 2] || marketRateInfo.currentPrice;
  const currentPrice = marketRateInfo.currentPrice;
  const priceChangePercent = lastPrice ? ((currentPrice - lastPrice) / lastPrice) * 100 : 0;
  
  // Transform price history into chart data
  const chartData = marketRateInfo.priceHistory.map((price, index) => ({
    day: `Day ${index + 1}`,
    price: price
  }));
  
  return (
    <>
      <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <div className="flex items-center justify-between">
            <div>
                 <p className="text-xs text-muted-foreground">Dynamic Price</p>
                 <div className="text-xl font-bold text-ayurveda-brown">₹{marketRateInfo.currentPrice.toLocaleString()}</div>
            </div>
          <div className="flex items-center">
            <div className={`text-sm flex items-center gap-1 ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={16} className={priceChangePercent < 0 ? 'transform -rotate-90' : 'transform rotate-45'} />
              {priceChangePercent.toFixed(1)}%
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setShowDialog(true)} className="ml-2 text-muted-foreground">
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dynamic pricing based on metal rates</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Current market rate: ₹{marketRateInfo.baseMetalPrice.toLocaleString()}/gram
        </p>
      </div>
      
      {/* Price details dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Dynamic Price Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Current Rate Information</h4>
              <p className="text-sm">Base Metal Price: ₹{marketRateInfo.baseMetalPrice.toLocaleString()}/gram</p>
              <p className="text-sm">Current Product Price: ₹{marketRateInfo.currentPrice.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Price History (Last 5 days)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#8B5CF6" 
                      activeDot={{ r: 8 }}
                      name="Price (₹)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>The price of this product fluctuates based on the market rate of its metal components.</p>
              <p>Last updated: May 6, 2025, 09:15 AM IST</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DynamicPriceCard;
