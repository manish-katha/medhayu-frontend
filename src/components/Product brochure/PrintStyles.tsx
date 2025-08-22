import React from 'react';

const PrintStyles = () => {
  return (
    <style jsx global>{`
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .no-print {
          display: none !important;
        }
        
        .print-break-before {
          page-break-before: always;
        }
        
        .print-break-after {
          page-break-after: always;
        }
        
        .print-break-inside-avoid {
          page-break-inside: avoid;
        }
        
        /* Optimize for A4 size */
        @page {
          size: A4;
          margin: 0.5in;
        }
        
        /* Ensure good contrast for printing */
        .text-amber-900 {
          color: #78350f !important;
        }
        
        .text-green-900 {
          color: #14532d !important;
        }
        
        .bg-gradient-to-r {
          background: linear-gradient(to right, var(--tw-gradient-stops)) !important;
        }
        
        /* Ensure borders print properly */
        .border-amber-200,
        .border-green-200 {
          border-color: #fde68a !important;
        }
        
        /* Maintain spacing for readability */
        .p-8 {
          padding: 1.5rem !important;
        }
        
        .p-6 {
          padding: 1rem !important;
        }
        
        .p-4 {
          padding: 0.75rem !important;
        }
      }
    `}</style>
  );
};

export default PrintStyles;