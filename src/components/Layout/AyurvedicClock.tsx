
'use client';

import React, { useState, useEffect } from 'react';
import { getDailyPanchanga } from '@/services/panchanga.service';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import LottiePlayer from '../ui/LottiePlayer';

import vataKalaAnimation from '@/icons/vata kala.json';
import pittaKalaAnimation from '@/icons/pitta kala.json';
import kaphaKalaAnimation from '@/icons/kapha kala.json';


const getDoshaInfo = (hour: number): { icon: any; text: string } => {
    if ((hour >= 6 && hour < 10) || (hour >= 18 && hour < 22)) {
        return { icon: kaphaKalaAnimation, text: 'Kapha Kāla' };
    }
    if ((hour >= 10 && hour < 14) || (hour >= 22 || hour < 2)) {
        return { icon: pittaKalaAnimation, text: 'Pitta Kāla' };
    }
    return { icon: vataKalaAnimation, text: 'Vāta Kāla' };
};

const getRitu = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 1 && day >= 15) || month === 2 || (month === 3 && day < 15)) return 'Śiśira';
    if ((month === 3 && day >= 15) || month === 4 || (month === 5 && day < 15)) return 'Vasanta';
    if ((month === 5 && day >= 15) || month === 6 || (month === 7 && day < 15)) return 'Grīṣma';
    if ((month === 7 && day >= 15) || month === 8 || (month === 9 && day < 15)) return 'Varṣā';
    if ((month === 9 && day >= 15) || month === 10 || (month === 11 && day < 15)) return 'Śarada';
    return 'Hemanta';
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-1 border-b border-dashed">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-right">{value}</span>
    </div>
);

const AyurvedicClock = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [panchanga, setPanchanga] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupActive, setIsPopupActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const panchangaData = await getDailyPanchanga();
        
        if (panchangaData && panchangaData.response) {
          setPanchanga(panchangaData.response);
        }

      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popupContainer = document.getElementById('ayurvedic-clock-container');
      if (popupContainer && !popupContainer.contains(event.target as Node)) {
        setIsPopupActive(false);
      }
    };

    if (isPopupActive) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupActive]);

  if (isLoading || !currentTime) {
    return <Skeleton className="w-[300px] h-[42px]" />;
  }

  const { icon: doshaAnimationData, text: doshaText } = getDoshaInfo(currentTime.getHours());

  return (
    <div id="ayurvedic-clock-container" className="relative">
      <div className="ayurveda-wrapper cursor-pointer" onClick={() => setIsPopupActive(p => !p)}>
        <div className="ayurveda-box">
             <div className="w-10 h-10 flex items-center justify-center">
                <LottiePlayer animationData={doshaAnimationData} className="w-12 h-12" />
             </div>
            <div className="time-info">
              <span className="time-display">{format(currentTime, 'hh:mm:ss a')}</span>
              <span className="dosha-text">{doshaText}</span>
            </div>
            <div className="separator-line" />
            <div className="date-ritu-info mr-1">
              <span className="date-display">{format(currentTime, 'E, d MMM')}</span>
              <span className="ritu-display">{getRitu(currentTime)} Ritu</span>
            </div>
        </div>
      </div>

      <div className={`popup ${isPopupActive ? 'active' : ''}`}>
        <div className="title">
          Daily Panchanga
        </div>
        <div className="description">
            {panchanga && panchanga.advanced_details ? (
            <div className="space-y-1">
                <DetailRow label="Samvatsara" value={panchanga.advanced_details.years.saka_samvaat_name} />
                <DetailRow label="Ayana" value={panchanga.advanced_details.masa.ayana} />
                <DetailRow label="Ritu" value={getRitu(currentTime)} />
                <DetailRow label="Masa" value={`${panchanga.advanced_details.masa.purnimanta_name}`} />
                <DetailRow label="Paksha" value={panchanga.advanced_details.masa.paksha} />
                <DetailRow label="Tithi" value={panchanga.tithi.name} />
                <DetailRow label="Vara" value={panchanga.day.name} />
                <DetailRow label="Nakshatra" value={panchanga.nakshatra.name} />
                <DetailRow label="Yoga" value={panchanga.yoga.name} />
                <DetailRow label="Karana" value={panchanga.karana.name} />
            </div>
            ) : (
                <p>Could not load detailed panchangam data.</p>
            )}
        </div>
        <div className="dismiss-btn">
          <button onClick={() => setIsPopupActive(false)}>Dismiss</button>
        </div>
      </div>
    </div>
  );
};

export default AyurvedicClock;
