
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from './use-toast';
import { CartItem } from '@/components/MarketPlace/CartDialog';
import { Product, VendorInfo } from '@/types/product';
import { Clinic } from '@/types/user';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  updateVendor: (id: number, vendorId: string) => void;
  updateVendorForSelectedItems: (itemIds: number[], newVendorId: string) => void;
  updateClinicForSelectedItems: (itemIds: number[], newClinicId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('opdo-cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
        console.error("Could not load cart from localStorage", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('opdo-cart', JSON.stringify(cartItems));
    } catch(error) {
       console.error("Could not save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (newItem: CartItem) => {
    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === newItem.id && item.vendorId === newItem.vendorId && item.clinicId === newItem.clinicId);
        
        if (existingItem) {
            return prevItems.map(item => 
                (item.id === newItem.id && item.vendorId === newItem.vendorId && item.clinicId === newItem.clinicId) 
                ? { ...item, quantity: (Number(item.quantity) || 0) + (Number(newItem.quantity) || 0) } 
                : item
            );
        }
        return [...prevItems, { ...newItem, price: Number(newItem.price) || 0, quantity: Number(newItem.quantity) || 0 }];
    });

    toast({
      title: "Added to Cart",
      description: `${newItem.quantity} × ${newItem.name} added.`,
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0)
    );
  };
  
  const updateVendor = (id: number, vendorId: string) => {
      setCartItems(prevItems => {
          const itemToUpdate = prevItems.find(item => item.id === id);
          if (!itemToUpdate) return prevItems;

          const itemIndex = prevItems.findIndex(item => item.id === id);
          if (itemIndex === -1) return prevItems;

          const otherItems = prevItems.filter((_, index) => index !== itemIndex);
          
          const existingItemIndex = otherItems.findIndex(item => item.id === id && item.vendorId === vendorId);

          if (existingItemIndex > -1) {
              const existingQty = Number(otherItems[existingItemIndex].quantity) || 0;
              const newQty = Number(itemToUpdate.quantity) || 0;
              otherItems[existingItemIndex].quantity = existingQty + newQty;
              return otherItems;
          } else {
              return [...otherItems, { ...itemToUpdate, vendorId }];
          }
      });
       toast({ title: "Vendor Updated", description: `Vendor has been changed.` });
  };
  
  const updateVendorForSelectedItems = (itemIds: number[], newVendorId: string) => {
    const allVendors = cartItems.flatMap(i => i.availableVendors || []);
    const newVendorName = allVendors.find(v => v.id === newVendorId)?.name || newVendorId;

    setCartItems(prevItems => {
        const updatedItems = prevItems.map(item => 
            itemIds.includes(item.id) ? { ...item, vendorId: newVendorId } : item
        );
        return mergeCartItems(updatedItems);
    });
    
    toast({ title: "Vendors Updated", description: `${itemIds.length} item(s) assigned to ${newVendorName}.` });
  };

  const updateClinicForSelectedItems = (itemIds: number[], newClinicId: string) => {
    setCartItems(prevItems => {
        const updatedItems = prevItems.map(item =>
            itemIds.includes(item.id) ? { ...item, clinicId: newClinicId } : item
        );
        return mergeCartItems(updatedItems);
    });
     toast({ title: "Clinics Updated", description: `${itemIds.length} item(s) assigned to a new clinic.` });
  };


  const removeItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem, updateVendor, updateVendorForSelectedItems, updateClinicForSelectedItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper function to merge cart items after an update
function mergeCartItems(items: CartItem[]): CartItem[] {
  const mergedMap = new Map<string, CartItem>();
  items.forEach(item => {
    const key = `${item.id}-${item.vendorId}-${item.clinicId}`;
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)!;
      existing.quantity += item.quantity;
    } else {
      mergedMap.set(key, { ...item });
    }
  });
  return Array.from(mergedMap.values());
}
