
export interface Medicine {
    name: string;
    form: 'tablet' | 'capsule' | 'powder' | 'churna' | 'liquid' | 'syrup' | 'oil' | 'other';
    sanskritName?: string;
  }
  
  export const medicines: Medicine[] = [
    // Tablets / Vati / Gulika
    { name: "Arogyavardhini Vati", form: "tablet" },
    { name: "Chandraprabha Vati", form: "tablet" },
    { name: "Sanjivani Vati", form: "tablet" },
    { name: "Kutajaghana Vati", form: "tablet" },
    { name: "Lasunadi Vati", form: "tablet" },
    { name: "Lavangadi Vati", form: "tablet" },
    { name: "Prabhakar Vati", form: "tablet" },
    { name: "Triphala Guggulu", form: "tablet" },
    { name: "Yogaraja Guggulu", form: "tablet" },
    { name: "Kaishore Guggulu", form: "tablet" },
  
    // Powders / Churna
    { name: "Ashwagandha Churna", form: "churna" },
    { name: "Triphala Churna", form: "churna" },
    { name: "Trikatu Churna", form: "churna" },
    { name: "Hingvashtak Churna", form: "churna" },
    { name: "Shatavari Churna", form: "powder" },
    { name: "Amalaki Churna", form: "powder" },
    { name: "Brahmi Churna", form: "powder" },
    { name: "Sitopaladi Churna", form: "churna" },
    { name: "Avipattikar Churna", form: "churna" },
    
    // Liquids / Asava / Arishta
    { name: "Abhayarishta", form: "liquid" },
    { name: "Amritarishta", form: "liquid" },
    { name: "Arjunarishta", form: "liquid" },
    { name: "Ashokarishta", form: "liquid" },
    { name: "Dasamoolarishta", form: "liquid" },
    { name: "Drakshasava", form: "liquid" },
    { name: "Khadirarishta", form: "liquid" },
    { name: "Kumaryasava", form: "liquid" },
  
    // Syrups
    { name: "Vasarishta", form: "syrup" },
    { name: "Kantakari Syrup", form: "syrup" },
    { name: "Honitus", form: "syrup" },
    
    // Oils / Taila
    { name: "Mahanarayan Oil", form: "oil" },
    { name: "Dhanwantaram Thailam", form: "oil" },
    { name: "Kottamchukkadi Thailam", form: "oil" },
    { name: "Bhringraj Oil", form: "oil" },
    { name: "Neelibringadi Oil", form: "oil" },
    { name: "Anu Thailam", form: "oil" },
    
    // Capsules
    { name: "Brahmi Capsule", form: "capsule" },
    { name: "Ashwagandha Capsule", form: "capsule" },
    { name: "Turmeric Capsule", form: "capsule" },
    
    // Other
    { name: "Chyawanprash", form: "other" }
  ];
  