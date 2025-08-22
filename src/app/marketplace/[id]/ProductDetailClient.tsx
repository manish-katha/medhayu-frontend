
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Info, CheckCircle2, AlertCircle, BarChart2, FlaskConical, Leaf, Download, Video, Eye } from 'lucide-react';
import DynamicPriceCard from '@/components/MarketPlace/DynamicPriceCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import CartDialog from '@/components/MarketPlace/CartDialog';
import { InfoChip } from '@/components/MarketPlace/InfoChip';
import { Label } from '@/components/ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductBrochure from '@/components/MarketPlace/ProductBrochure';
import html2pdf from 'html2pdf.js';
import AyurvedaBrochure from '@/components/Product brochure/AyurvedaBrochure';
import { sampleProductData } from '@/components/Product brochure/ProductData';

interface ProductDetailClientProps {
  product: Product;
}

const SafetyBadge = ({ status }: { status: 'pass' | 'fail' | 'pending' }) => {
    const config = {
        pass: { icon: <CheckCircle2 size={14}/>, text: 'Pass', color: 'text-green-600 bg-green-100/50' },
        fail: { icon: <AlertCircle size={14}/>, text: 'Fail', color: 'text-red-600 bg-red-100/50' },
        pending: { icon: <BarChart2 size={14}/>, text: 'Pending', color: 'text-amber-600 bg-amber-100/50' },
    };
    const current = config[status];
    return <Badge variant="outline" className={cn("gap-1", current.color)}>{current.icon} {current.text}</Badge>
};

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product }) => {
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
  const [isBrochureViewOpen, setIsBrochureViewOpen] = useState(false);
  
  const handleDownloadBrochure = () => {
    const element = document.getElementById('product-brochure-content');
    if (element) {
        const opt = {
          margin:       0,
          filename:     `${sampleProductData.name}_Brochure.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    }
  };

  return (
    <>
    <div className="space-y-8">
      {/* Profile Card */}
      <Card>
        <div className="relative h-48 md:h-64 bg-muted/30">
          <Image
            src={product.coverImage || 'https://placehold.co/1200x400.png'}
            alt={`${product.name} cover`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            data-ai-hint="background landscape"
          />
        </div>
        <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-20 md:-mt-24 items-end">
                <div className="relative flex-shrink-0">
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={160}
                        height={160}
                        className="rounded-lg border-4 border-background bg-background object-cover shadow-lg w-32 h-32 md:w-40 md:h-40"
                    />
                </div>
                <div className="flex-grow">
                    <Badge variant="outline" className="mb-2">{product.productType}</Badge>
                     <CardTitle className="text-2xl md:text-3xl font-bold font-headline">{product.name}</CardTitle>
                     <CardDescription>{product.sanskritName && `(${product.sanskritName})`} • {product.botanicalName}</CardDescription>
                     <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating} ({product.reviews} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>
             <div className="mt-4 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
             <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
                <CardTitle>Purchase Options</CardTitle>
                <div className="mt-4 space-y-4">
                    {product.isDynamic && product.marketRateInfo ? (
                        <DynamicPriceCard marketRateInfo={product.marketRateInfo} />
                    ) : (
                        <div className="text-4xl font-bold text-ayurveda-brown">₹{product.price.toLocaleString()}</div>
                    )}
                    <Button size="lg" className="w-full md:w-auto" onClick={() => setIsCartDialogOpen(true)}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>
                </div>
             </div>
        </div>
      </Card>
      
      {/* Technical Details Card */}
      <Card>
        <Tabs defaultValue="ayurvedic">
            <CardHeader>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ayurvedic">Ayurvedic Properties</TabsTrigger>
                    <TabsTrigger value="scientific">Scientific Details</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery &amp; Downloads</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
                <TabsContent value="ayurvedic" className="mt-4">
                     <CardHeader className="p-0 mb-4">
                        <CardTitle>Dravya Guna</CardTitle>
                        <CardDescription>Based on classical Ayurvedic principles.</CardDescription>
                    </CardHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InfoChip label="Rasa (Taste)" value={product.rasa} />
                            <InfoChip label="Guna (Qualities)" value={product.guna} />
                            <InfoChip label="Virya (Potency)" value={product.virya} />
                            <InfoChip label="Vipaka (Post-digestive)" value={product.vipaka} />
                        </div>
                        <InfoChip label="Karma (Actions)" value={product.karma} />
                        <InfoChip label="Dosha Action" value={product.doshaAction} />
                    </div>
                </TabsContent>
                <TabsContent value="scientific" className="mt-4">
                     <CardHeader className="p-0 mb-4">
                        <CardTitle>Scientific Details</CardTitle>
                        <CardDescription>Modern scientific and safety information.</CardDescription>
                    </CardHeader>
                    <div className="space-y-4">
                        <InfoChip label="Main Constituents" value={product.mainConstituents} icon={<FlaskConical size={14}/>} />
                        <InfoChip label="Pharmacological Use" value={product.pharmacologicalUse} icon={<Leaf size={14}/>} />
                        {product.clinicalTrialsUrl && (
                            <div className="p-3 rounded-lg border bg-muted/30">
                                <Label className="text-xs text-muted-foreground">Clinical Trials</Label>
                                <Button variant="link" asChild className="p-0 h-auto font-semibold block"><a href={product.clinicalTrialsUrl} target="_blank" rel="noopener noreferrer">View on PubMed</a></Button>
                            </div>
                        )}
                        {product.safetyReport && (
                            <div className="p-3 rounded-lg border bg-muted/30 grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Heavy Metals</Label>
                                <SafetyBadge status={product.safetyReport.heavyMetals} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Microbial</Label>
                                <SafetyBadge status={product.safetyReport.microbial} />
                            </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
                 <TabsContent value="gallery" className="mt-4">
                     <CardHeader className="p-0 mb-4">
                        <CardTitle>Media Gallery</CardTitle>
                        <CardDescription>View product images, videos, and documents.</CardDescription>
                    </CardHeader>
                    <Carousel className="w-full max-w-lg mx-auto">
                      <CarouselContent>
                        {(product.gallery && product.gallery.length > 0 ? product.gallery : [product.image]).map((img, index) => (
                          <CarouselItem key={index}>
                            <Card>
                              <CardContent className="flex aspect-square items-center justify-center p-6">
                                <Image src={img} alt={`${product.name} image ${index + 1}`} width={400} height={400} className="rounded-lg object-cover"/>
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                     <div className="flex justify-center gap-4 mt-4">
                        <Button variant="outline" onClick={() => setIsBrochureViewOpen(true)}>
                            <Eye className="mr-2 h-4 w-4" /> View Brochure
                        </Button>
                        <Button variant="outline" onClick={handleDownloadBrochure}>
                            <Download className="mr-2 h-4 w-4" /> Download Brochure
                        </Button>
                        {product.videoUrl && (
                            <Button asChild>
                                <a href={product.videoUrl} target="_blank" rel="noopener noreferrer">
                                    <Video className="mr-2 h-4 w-4" /> Watch Video
                                </a>
                            </Button>
                        )}
                    </div>
                </TabsContent>
            </CardContent>
        </Tabs>
      </Card>
    </div>
    
    <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -100 }}>
      <div id="product-brochure-content">
        <AyurvedaBrochure productData={sampleProductData} />
      </div>
    </div>
    
    <CartDialog
        open={isCartDialogOpen}
        onOpenChange={setIsCartDialogOpen}
        product={product}
    />
     <Dialog open={isBrochureViewOpen} onOpenChange={setIsBrochureViewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
                <DialogTitle>Brochure Preview: {sampleProductData.name}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto bg-muted">
                <AyurvedaBrochure productData={sampleProductData} />
            </div>
        </DialogContent>
     </Dialog>
    </>
  );
};

export default ProductDetailClient;
