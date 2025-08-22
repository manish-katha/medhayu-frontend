
"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();
    
    useEffect(() => {
        if (isMobile) {
            setOpen(false);
        }
    }, [isMobile]);

    return (
        <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open, setOpen, isMobile } = useSidebar();
  
  if (isMobile) {
    return (
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed h-full w-full inset-0 bg-black/80 z-50"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  "fixed h-full w-[270px] inset-y-0 left-0 bg-card z-[100] flex flex-col justify-between",
                  className
                )}
              >
                 <div
                    className="absolute right-4 top-4 z-50 text-foreground"
                    onClick={() => setOpen(!open)}
                  >
                    <X className="h-5 w-5"/>
                  </div>
                {children}
              </motion.div>
            </>
          )}
        </AnimatePresence>
    )
  }

  return (
      <motion.div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        data-collapsible={open ? "open" : "icon"}
        className={cn(
          "group h-full hidden md:flex md:flex-col bg-card shrink-0 border-r border-border",
          className
        )}
        animate={{
          width: open ? "260px" : "80px",
        }}
      >
        {children}
      </motion.div>
  );
};


export const SidebarBody = (props: React.ComponentProps<"div">) => {
  return (
    <div
      className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden"
      {...props}
    />
  );
};
