
'use client';
import { useState, useEffect } from 'react';

export interface DeshaData {
  rainfall: number;           // mm/year
  humidity: number;           // percentage
  soilType: string;           // 'sandy', 'clayey', 'marshy', 'dry'
  vegetationIndex: number;    // NDVI value, 0.0 - 1.0
}

export function useDeshaClassifier(apiData?: DeshaData | null) {
  const [desha, setDesha] = useState<'JANGALA' | 'ANUPA' | 'SADHARANA' | null>(null);

  useEffect(() => {
    if (!apiData) {
      setDesha(null);
      return;
    }

    const { rainfall, humidity, soilType, vegetationIndex } = apiData;

    // Rules based on the provided logic
    if (
      rainfall < 700 &&
      humidity < 40 &&
      ['sandy', 'dry'].includes(soilType) &&
      vegetationIndex <= 0.2
    ) {
      setDesha('JANGALA');
    } else if (
      rainfall > 2000 &&
      humidity > 70 &&
      ['clayey', 'marshy'].includes(soilType) &&
      vegetationIndex >= 0.6
    ) {
      setDesha('ANUPA');
    } else {
      setDesha('SADHARANA');
    }
  }, [apiData]);

  return desha;
}
