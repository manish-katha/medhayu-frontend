

export interface VendorInfo {
  id: string;
  name: string;
}

export interface Product {
    id: number;
    name: string;
    image: string;
    coverImage?: string;
    gallery?: string[];
    brochureUrl?: string;
    videoUrl?: string;
    mrp: number;
    price: number; 
    rating: number;
    reviews: number;
    category: string;
    tags: string[];
    specializationTags?: string[];
    applicableDiseases?: string[];
    brand?: string;
    isDynamic: boolean;
    marketRateInfo?: {
      baseMetalPrice: number;
      currentPrice: number;
      priceHistory: number[];
    };
    description: string;
    productType: 'Single Herb' | 'Classical Formulation' | 'Proprietary';

    // Ayurvedic Properties
    sanskritName?: string;
    rasa?: string[]; // Taste
    guna?: string[]; // Qualities
    virya?: string;  // Potency
    vipaka?: string; // Post-digestive effect
    karma?: string[]; // Actions
    doshaAction?: string[];

    // Scientific Details
    botanicalName?: string;
    mainConstituents?: string[];
    pharmacologicalUse?: string;
    clinicalTrialsUrl?: string;
    safetyReport?: {
        heavyMetals: 'pass' | 'fail' | 'pending';
        microbial: 'pass' | 'fail' | 'pending';
    };
    organTarget?: string[];
    vendors: VendorInfo[];

    // New properties for OPDO
    attestedByVaidyas?: number;
    usedInClinics?: number;
    recommendedBy?: string; // Name of recommending doctor
  }
