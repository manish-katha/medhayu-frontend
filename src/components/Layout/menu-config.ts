
import { 
  Home, Users, Calendar, FileText, Heart, Book, Settings, 
  MessageSquare, ShoppingCart, Building, Archive, Truck,
  CreditCard, Receipt, Microscope, Stethoscope, LayoutDashboard, BrainCircuit, Package, BookOpen, Wallet, Quote as QuoteIcon, Library, User, NotebookText, Sparkles, Rss
} from 'lucide-react';

export const ALL_MODULES = [
  'dashboard', 
  'clinic', 
  'erp', 
  'svadhyaya', 
  'marketplace'
] as const;

export const ALL_MEDHAYU_MODULES = [
    'medhayu-dashboard',
    'medhayu-svadhyaya',
    'medhayu-samaja'
] as const;


export type ModuleKey = typeof ALL_MODULES[number];
export type MedhayuModuleKey = typeof ALL_MEDHAYU_MODULES[number];

type MenuItem = {
  name: string;
  icon: React.ElementType;
  path: string;
};

type ModuleConfig = {
  name: string;
  icon: React.ElementType;
  items: MenuItem[];
};

export const menuConfig: Record<ModuleKey, ModuleConfig> = {
  dashboard: {
    name: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { name: 'Main Dashboard', icon: Home, path: '/' },
      { name: 'Unified Experience', icon: Stethoscope, path: '/unified-experience' },
    ],
  },
  clinic: {
    name: 'Clinic',
    icon: Stethoscope,
    items: [
      { name: 'Patients', icon: Users, path: '/patients' },
      { name: 'Appointments', icon: Calendar, path: '/appointments' },
      { name: 'Prescriptions', icon: FileText, path: '/prescriptions' },
      { name: 'WhatsApp', icon: MessageSquare, path: '/whatsapp' },
    ],
  },
  svadhyaya: {
    name: 'स्वाध्याय',
    icon: BookOpen,
    items: [
      { name: 'Knowledge Base', icon: Book, path: '/knowledge-base' },
      { name: 'Case Studies', icon: Heart, path: '/case-studies' },
      { name: 'Articles', icon: FileText, path: '/articles' },
    ],
  },
  erp: {
    name: 'ERP System',
    icon: Building,
    items: [
      { name: 'ERP Dashboard', icon: Building, path: '/erp' },
      { name: 'My Clinics', icon: Building, path: '/erp/clinics' },
      { name: 'Documents', icon: Archive, path: '/erp/documents' },
      { name: 'Vendors', icon: Truck, path: '/erp/vendors' },
      { name: 'Inventory', icon: Package, path: '/erp/inventory' },
      { name: 'Sales', icon: CreditCard, path: '/erp/sales' },
      { name: 'Purchases', icon: ShoppingCart, path: '/erp/purchases' },
      { name: 'Billing & GST', icon: Receipt, path: '/erp/billing' },
      { name: 'Wallet', icon: Wallet, path: '/wallet' },
    ],
  },
  marketplace: {
    name: 'Marketplace',
    icon: ShoppingCart,
    items: [
      { name: 'Browse Products', icon: ShoppingCart, path: '/marketplace' },
    ],
  }
};


export const medhayuMenuConfig: Record<MedhayuModuleKey, ModuleConfig> = {
    'medhayu-dashboard': {
        name: 'Dashboard',
        icon: LayoutDashboard,
        items: [
            { name: 'Profile', icon: User, path: '/medhayu/profile' },
            { name: 'Wall', icon: Rss, path: '/medhayu/wall' },
        ],
    },
    'medhayu-svadhyaya': {
        name: 'स्वाध्याय',
        icon: BookOpen,
        items: [
            { name: 'Books', icon: Book, path: '/medhayu/books' },
            { name: 'Living Document', icon: BrainCircuit, path: '/medhayu/living-document' },
            { name: 'Standalone Articles', icon: FileText, path: '/medhayu/articles' },
            { name: 'Quotes', icon: QuoteIcon, path: '/medhayu/quotes' },
            { name: 'Citations', icon: Library, path: '/medhayu/citations' },
            { name: 'Glossary', icon: NotebookText, path: '/medhayu/glossary' },
            { name: 'Media Library', icon: Wallet, path: '/media'},
        ],
    },
    'medhayu-samaja': {
        name: 'समाज',
        icon: Users,
        items: [
            { name: 'Circles', icon: Users, path: '/medhayu/circles' },
            { name: 'Discover People', icon: Users, path: '/medhayu/discover' },
        ]
    }
};
