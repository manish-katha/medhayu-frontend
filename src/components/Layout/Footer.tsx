
import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t py-2 px-6 bg-background shrink-0">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} OPDO - Ayurvedic Patient-Doctor Operations Platform
        </p>
        <div className="flex items-center space-x-1 mt-1 md:mt-0">
          <span className="text-xs text-muted-foreground">
            Made with 
          </span>
          <Heart size={12} className="text-ayurveda-terracotta" />
          <span className="text-xs text-muted-foreground">
             for Ayurvedic practitioners
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
