
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, MoreVertical, X, GripVertical, ChevronLeft, User as UserIcon, Settings, Microscope, Stethoscope, Rows3, ExternalLink
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ALL_MODULES, menuConfig, ALL_MEDHAYU_MODULES, medhayuMenuConfig } from './menu-config';
import { useWindowModules } from '@/hooks/useWindowModules.tsx';
import type { UserProfile } from '@/types/user.types';
import { useAppMode } from './MainLayout';
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from '@/services/user.service';


interface SidebarProps {
  pinned: boolean;
  togglePin: () => void;
}

const NavLink = ({ item, pinned }: { item: { name: string; icon: React.ElementType; path: string }, pinned: boolean }) => {
    const pathname = usePathname();
    const isActive = (item.path === '/' && pathname === '/') || (item.path !== '/' && pathname.startsWith(item.path));

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                <Link
                    href={item.path}
                    className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                >
                    <item.icon size={18} className="flex-shrink-0" />
                    <span className={cn("ml-3 transition-opacity duration-200", pinned ? "opacity-100" : "opacity-0 hidden")}>{item.name}</span>
                </Link>
                </TooltipTrigger>
                {!pinned && (
                <TooltipContent side="right">
                    <p>{item.name}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    )
};

const SortableModule = ({ id, moduleKey, pinned, config }: { id: string, moduleKey: any, pinned: boolean, config: any }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const module = config[moduleKey];
    if (!module) return null;

    return (
        <div ref={setNodeRef} style={style}>
            <div className={cn("my-4 mx-3 flex items-center gap-2")}>
                {pinned && (
                    <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground">
                        <GripVertical size={16} />
                    </div>
                )}
                <div className={cn("h-px flex-1 bg-border", pinned && "hidden")}></div>
                <span className="text-xs font-medium text-muted-foreground uppercase">{pinned ? module.name : <module.icon size={16}/>}</span>
                <div className="h-px flex-1 bg-border"></div>
            </div>
            <div className="space-y-1">
              {module.items.map((item: any) => <NavLink key={item.path} item={item} pinned={pinned}/>)}
            </div>
        </div>
    )
}

const ProfileCard = ({ brand, userProfile }: { brand: 'MY CLINIC' | 'MEDHAYU', userProfile: UserProfile | null }) => {

  if (brand === 'MY CLINIC') {
    return (
      <div className="profile-card-wrapper my-clinic">
        <div className="profile-card-banner" style={{backgroundImage: `url('https://placehold.co/320x120/a86c5d/FFFFFF/png')`}} data-ai-hint="clinic building exterior"></div>
        <div className="profile-card-details">
          <div className="profile-card-dp">
             <Image src="https://placehold.co/150x150.png" width={150} height={150} alt="Clinic Logo" data-ai-hint="logo" />
          </div>
          <div className="profile-card-name">
            <h2>Oshadham Ayurveda<span>Jayanagar, Bangalore</span></h2>
          </div>
          <div className="profile-card-followers">
            <h2>150<span>Active Patients</span></h2>
          </div>
          <div className="profile-card-button">
            <Link href="/settings">Manage Clinic</Link>
          </div>
        </div>
      </div>
    );
  }

  if (brand === 'MEDHAYU' && userProfile) {
    return (
      <div className="profile-card-wrapper medhayu">
         <div className="profile-card-banner" style={{backgroundImage: `url(${userProfile.coverUrl})`}}></div>
         <div className="profile-card-details">
            <div className="profile-card-dp">
                <Image src={userProfile.avatarUrl} width={150} height={150} alt={userProfile.name}/>
            </div>
            <div className="profile-card-name">
              <h2>{userProfile.name}<span>{userProfile.experience[0]?.title || 'Ayurveda Practitioner'}</span></h2>
            </div>
             <div className="profile-card-followers-wrap">
                <div className="insta-follow">
                    <h2>{userProfile.stats.circles}<span>Circles</span></h2>
                </div>
                <div className="insta-follow">
                    <h2>{userProfile.stats.views}<span>Views</span></h2>
                </div>
            </div>
             <div className="profile-card-button">
                <Link href="/medhayu/profile">View Profile</Link>
            </div>
         </div>
      </div>
    );
  }

  return null; // or a loading skeleton
};

const Sidebar = ({ pinned, togglePin }: SidebarProps) => {
  const { currentModules, isModuleActive, toggleModule, detachModule, reorderModules, currentMedhayuModules, reorderMedhayuModules } = useWindowModules();
  const [brand, setBrand] = useState<'MY CLINIC' | 'MEDHAYU'>('MY CLINIC');
  const { mode, setMode } = useAppMode();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if(user) {
        const profile = await getUserProfile(user.email);
        setUserProfile(profile);
      }
    }
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const savedBrand = localStorage.getItem('opdo-brand-selection') as 'MY CLINIC' | 'MEDHAYU';
    if (savedBrand) {
      setBrand(savedBrand);
    }
  }, []);

  const handleSetBrand = (newBrand: 'MY CLINIC' | 'MEDHAYU') => {
    setBrand(newBrand);
    localStorage.setItem('opdo-brand-selection', newBrand);
    // Navigate to the correct root page when brand is switched
    if (newBrand === 'MY CLINIC') {
      router.push('/');
    } else {
      router.push('/medhayu/profile');
    }
  };

  const handleLogout = () => {
    logout(() => {
      router.push('/login');
    });
  };

  const currentConfig = brand === 'MY CLINIC' ? menuConfig : medhayuMenuConfig;
  const modulesToRender = brand === 'MY CLINIC' ? currentModules : currentMedhayuModules;
  const reorderFunction = brand === 'MY CLINIC' ? reorderModules : reorderMedhayuModules;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (active.id !== over?.id) {
        const oldIndex = modulesToRender.findIndex((m) => m === active.id);
        const newIndex = modulesToRender.findIndex((m) => m === over?.id);
        reorderFunction(oldIndex, newIndex);
    }
  }

  return (
    <>
      <div 
        id="sidebar"
        className={cn(
          "bg-card h-screen transition-all duration-300 border-r border-border fixed top-0 left-0 flex flex-col z-50",
          pinned ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center justify-center p-4 border-b border-border h-16 flex-shrink-0">
          <div className="relative flex w-full p-1 bg-ayurveda-green/20 rounded-full">
            <div 
              className={cn(
                  "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-full shadow-md transition-transform duration-300 ease-in-out",
                  brand === 'MY CLINIC' ? 'transform translate-x-1' : 'transform translate-x-[calc(100%+3px)]'
              )}
            />
            <label className="relative w-1/2 p-1 text-center text-sm font-semibold cursor-pointer z-10 transition-colors"
                    onClick={() => handleSetBrand('MY CLINIC')}>
              <span className={cn(brand === 'MY CLINIC' ? 'text-ayurveda-green' : 'text-white/80')}>MY CLINIC</span>
            </label>
            <label className="relative w-1/2 p-1 text-center text-sm font-semibold cursor-pointer z-10 transition-colors"
                    onClick={() => handleSetBrand('MEDHAYU')}>
                <span className={cn(brand === 'MEDHAYU' ? 'text-ayurveda-green' : 'text-white/80')}>MEDHAYU</span>
            </label>
          </div>
        </div>

        <button
          onClick={togglePin}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -right-3 bg-ayurveda-green text-white rounded-full p-1 shadow-md hover:bg-ayurveda-green/90 transition-all z-50",
            pinned ? "rotate-180" : ""
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <ScrollArea className="flex-1">
          {pinned && <ProfileCard brand={brand} userProfile={userProfile} />}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modulesToRender} strategy={verticalListSortingStrategy}>
              <div className="py-4 px-3">
                {modulesToRender.map(moduleKey => (
                  <SortableModule key={moduleKey as string} id={moduleKey as string} moduleKey={moduleKey} pinned={pinned} config={currentConfig} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>

        <div className="p-2 border-t border-border mt-auto flex items-center justify-around">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon">
                        <UserIcon size={18} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/settings" passHref>
                <Button variant="ghost" size="icon">
                    <Settings size={18} />
                </Button>
            </Link>
          
            <div className="relative flex w-24 p-1 bg-muted rounded-full">
                <div
                    className={cn(
                        "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-full shadow-md transition-transform duration-300 ease-in-out",
                        mode === 'clinic' ? 'transform translate-x-1' : 'transform translate-x-[calc(100%+3px)]'
                    )}
                />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                className="relative w-1/2 p-1 flex items-center justify-center z-10"
                                onClick={() => setMode('clinic')}
                                aria-label="Clinic Mode"
                            >
                                <Stethoscope size={16} className={cn(mode === 'clinic' ? 'text-ayurveda-green' : 'text-muted-foreground')} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Clinic Mode</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <button
                                className="relative w-1/2 p-1 flex items-center justify-center z-10"
                                onClick={() => setMode('research')}
                                aria-label="Research Mode"
                            >
                                <Microscope size={16} className={cn(mode === 'research' ? 'text-ayurveda-green' : 'text-muted-foreground')} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Research Mode</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
