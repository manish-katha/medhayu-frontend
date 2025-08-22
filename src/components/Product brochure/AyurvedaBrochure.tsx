
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Download, Eye, Star, Award, Leaf, Heart } from 'lucide-react';
import { ProductData } from './ProductData';
import { InfoChip } from '../MarketPlace/InfoChip';

interface AyurvedaBrochureProps {
  productData: ProductData;
}

const AyurvedaBrochure: React.FC<AyurvedaBrochureProps> = ({ productData }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden print-break-inside-avoid">
      {/* Header Section */}
      <div className="relative h-80 bg-gradient-to-r from-amber-50 to-orange-50 print-break-inside-avoid">
        <div className="absolute inset-0">
          <img 
            src={productData.coverImage} 
            alt="Ayurveda Product Cover"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center p-8">
          <div>
            <div className="mb-4">
              <Leaf className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Premium Ayurvedic Extract
              </Badge>
            </div>
            <h1 className="text-4xl text-amber-900 mb-2">
              {productData.name}
            </h1>
            <p className="text-lg text-amber-700">
              {productData.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Doctor Profile Section */}
      <div className="p-8 bg-gradient-to-r from-amber-50 to-orange-50 print-break-inside-avoid">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <img 
              src={productData.doctor.image}
              alt={productData.doctor.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-200"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl text-amber-900 mb-1">
              {productData.doctor.name}
            </h3>
            <p className="text-amber-700 mb-1">{productData.doctor.qualification}</p>
            <p className="text-amber-600 mb-3">{productData.doctor.experience}</p>
            <blockquote className="italic text-amber-800 border-l-4 border-amber-300 pl-4">
              "{productData.doctor.quote}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* Product Gallery */}
      <div className="p-8 print-break-inside-avoid">
        <h2 className="text-2xl text-amber-900 mb-6 text-center">
          Product Gallery
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {productData.gallery.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <img 
                src={image}
                alt={`Product view ${index + 1}`}
                className="w-full h-32 object-cover"
              />
            </Card>
          ))}
        </div>
      </div>

      {/* Dravya Guna Section */}
      <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 print-break-inside-avoid">
        <h2 className="text-2xl text-green-900 mb-6 text-center">
          Dravya Guna (Ayurvedic Properties)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 border-green-200">
            <CardContent className="p-0">
              <div className="space-y-3">
                <InfoChip label="Rasa (Taste)" value={productData.dravyaGuna.rasa} />
                <InfoChip label="Virya (Potency)" value={productData.dravyaGuna.virya} />
                <InfoChip label="Vipaka (Post-digestive effect)" value={productData.dravyaGuna.vipaka} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4 border-green-200">
            <CardContent className="p-0">
              <div className="space-y-3">
                <InfoChip label="Prabhava (Special Effect)" value={productData.dravyaGuna.prabhava} />
                <InfoChip label="Dosha Effect" value={productData.dravyaGuna.doshaEffect} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scientific Benefits */}
      <div className="p-8 print-break-inside-avoid">
        <h2 className="text-2xl text-amber-900 mb-6 text-center">
          Scientific Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productData.scientificBenefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
              <Star className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Description */}
      <div className="p-8 bg-gradient-to-r from-amber-50 to-orange-50 print-break-inside-avoid">
        <h2 className="text-2xl text-amber-900 mb-4 text-center">
          About This Product
        </h2>
        <p className="text-amber-800 text-center leading-relaxed max-w-3xl mx-auto">
          {productData.description}
        </p>
      </div>

      {/* Certifications */}
      <div className="p-8 print-break-inside-avoid">
        <h3 className="text-xl text-amber-900 mb-4 text-center">
          Quality Certifications
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {productData.certifications.map((cert, index) => (
            <Badge key={index} className="bg-green-100 text-green-800 border-green-300 gap-2">
              <Award className="h-4 w-4" />
              {cert}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="mx-8" />

      {/* Call to Action */}
      <div className="p-8 bg-gradient-to-r from-ayurveda-brown to-ayurveda-terracotta text-white print-break-inside-avoid">
        <div className="text-center">
          <h2 className="text-2xl mb-4">
            Experience Ancient Wisdom Today
          </h2>
          <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
            Download the complete product brochure or view our full catalog online to discover the power of authentic Ayurvedic medicine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-amber-900 hover:bg-amber-50 gap-2"
              onClick={() => window.print()}
            >
              <Download className="h-5 w-5" />
              Download PDF Brochure
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-amber-900 gap-2"
              onClick={() => window.open('#', '_blank')}
            >
              <Eye className="h-5 w-5" />
              View Online Catalog
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-amber-50 text-center print-break-inside-avoid">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span className="text-amber-700">Made with care according to traditional Ayurvedic principles</span>
        </div>
        <p className="text-amber-600">
          This product has not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>
    </div>
  );
};

export default AyurvedaBrochure;
