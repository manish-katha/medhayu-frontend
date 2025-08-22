export interface ProductData {
  name: string;
  subtitle: string;
  description: string;
  coverImage: string;
  
  doctor: {
    name: string;
    qualification: string;
    experience: string;
    image: string;
    quote: string;
  };
  
  gallery: string[];
  
  dravyaGuna: {
    rasa: string;
    virya: string;
    vipaka: string;
    prabhava: string;
    doshaEffect: string;
  };
  
  scientificBenefits: string[];
  certifications: string[];
}

// Sample product data - can be easily replaced with API data
export const sampleProductData: ProductData = {
  name: "Ashwagandha Premium Extract",
  subtitle: "Ancient Wisdom, Modern Science",
  description: "Pure Ashwagandha root extract standardized to 5% withanolides for optimal potency and efficacy. Sourced from organic farms in India and processed using traditional methods combined with modern quality control.",
  coverImage: "https://placehold.co/800x400/a86c5d/FFFFFF/png",
  
  doctor: {
    name: "Dr. Ayush Sharma",
    qualification: "B.A.M.S., M.D. (Ayurveda)",
    experience: "15+ years in Ayurvedic Practice",
    image: "https://placehold.co/300x300.png",
    quote: "Ashwagandha is nature's answer to modern stress. Our premium extract maintains the traditional potency while meeting contemporary quality standards."
  },
  
  gallery: [
    "https://placehold.co/300x200/c4913f/FFFFFF/png?text=Roots",
    "https://placehold.co/300x200/a86c5d/FFFFFF/png?text=Powder",
    "https://placehold.co/300x200/678B61/FFFFFF/png?text=Capsules"
  ],
  
  dravyaGuna: {
    rasa: "Madhura (Sweet), Tikta (Bitter), Kasaya (Astringent)",
    virya: "Ushna (Hot)",
    vipaka: "Madhura (Sweet)",
    prabhava: "Rasayana (Rejuvenative), Balya (Strengthening)",
    doshaEffect: "Reduces Vata and Kapha, may increase Pitta in excess"
  },
  
  scientificBenefits: [
    "Reduces cortisol levels by up to 30%",
    "Improves sleep quality and duration",
    "Enhances physical performance and muscle strength",
    "Supports cognitive function and memory",
    "Helps manage stress and anxiety naturally"
  ],
  
  certifications: ["Organic Certified", "GMP Certified", "Third-Party Tested", "Ayush Approved"]
};

// Alternative product data examples for different Ayurvedic products
export const turmericProductData: ProductData = {
  name: "Curcumin Advanced Formula",
  subtitle: "Golden Healing Power",
  description: "High-potency curcumin extract with piperine for enhanced bioavailability. Standardized to 95% curcuminoids for maximum therapeutic benefits.",
  coverImage: "https://placehold.co/800x400/F4A261/FFFFFF/png",
  
  doctor: {
    name: "Dr. Priya Mehta",
    qualification: "B.A.M.S., Ph.D. (Ayurveda)",
    experience: "20+ years in Ayurvedic Research",
    image: "https://placehold.co/300x300.png",
    quote: "Turmeric is the golden spice of life. Our advanced formula ensures maximum absorption and therapeutic efficacy."
  },
  
  gallery: [
    "https://placehold.co/300x200/c4913f/FFFFFF/png",
    "https://placehold.co/300x200/a86c5d/FFFFFF/png",
    "https://placehold.co/300x200/678B61/FFFFFF/png"
  ],
  
  dravyaGuna: {
    rasa: "Tikta (Bitter), Katu (Pungent)",
    virya: "Ushna (Hot)",
    vipaka: "Katu (Pungent)",
    prabhava: "Lekhana (Scraping), Shotahara (Anti-inflammatory)",
    doshaEffect: "Reduces Kapha and Vata, may increase Pitta"
  },
  
  scientificBenefits: [
    "Powerful anti-inflammatory properties",
    "Supports joint health and mobility",
    "Enhances immune system function",
    "Promotes healthy digestion",
    "Provides antioxidant protection"
  ],
  
  certifications: ["Organic Certified", "Non-GMO", "Gluten-Free", "Third-Party Tested"]
};