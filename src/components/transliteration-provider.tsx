
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useLayoutEffect, useRef } from 'react';
// @ts-ignore
import * as Sanscript from '@sanskrit-coders/sanscript';

// Map user-friendly names to library scheme names, now with proper labels
export const SCRIPT_DEFINITIONS: { [key: string]: { scheme: string; label: string } } = {
  'DEVANAGARI': { scheme: 'devanagari', label: 'Devanagari' },
  'KANNADA':    { scheme: 'kannada', label: 'Kannada' },
  'TELUGU':     { scheme: 'telugu', label: 'Telugu' },
  'TAMIL':      { scheme: 'tamil', label: 'Tamil' },
  'MALAYALAM':  { scheme: 'malayalam', label: 'Malayalam' },
  'GUJARATI':   { scheme: 'gujarati', label: 'Gujarati' },
  'BENGALI':    { scheme: 'bengali', label: 'Bengali' },
  'GURMUKHI':   { scheme: 'gurmukhi', label: 'Gurmukhi' },
  'IAST':       { scheme: 'iast', label: 'IAST (Diacritical)' },
  'ITRANS':     { scheme: 'itrans', label: 'ITRANS (Phonetic)' },
  'HK':         { scheme: 'hk', label: 'Harvard-Kyoto' },
  'SLP1':       { scheme: 'slp1', label: 'SLP1' },
};


export const AVAILABLE_SCRIPT_KEYS = Object.keys(SCRIPT_DEFINITIONS);

interface TransliterationContextType {
  targetScript: string;
  setTargetScript: (script: string) => void;
  transliterateText: (text: string) => string;
}

const TransliterationContext = createContext<TransliterationContextType | undefined>(undefined);

/**
 * Post-processes transliterated text for specific Indic scripts to match modern
 * orthographic conventions, primarily handling the anusvara rule where a class
 * nasal before a consonant of the same class is replaced by an anusvara.
 * @param text The transliterated text from the sanscript library.
 * @param script The target script key (e.g., 'KANNADA').
 * @returns The corrected text.
 */
function applyOrthographicFixes(text: string, script: string): string {
  let result = text;
  // This rule replaces a class nasal + virama with an anusvara when it precedes
  // a stop consonant of the same class. This reflects modern writing conventions
  // in many Indic scripts.
  switch (script) {
    case 'KANNADA':
      result = result.replace(/ಙ್(?=[ಕಖಗಘ])/g, 'ಂ'); // Velar
      result = result.replace(/ಞ್(?=[ಚಛಜಝ])/g, 'ಂ'); // Palatal
      result = result.replace(/ಣ್(?=[ಟಠಡಢ])/g, 'ಂ'); // Retroflex
      result = result.replace(/ನ್(?=[ತಥದಧ])/g, 'ಂ'); // Dental
      result = result.replace(/ಮ್(?=[ಪಫಬಭ])/g, 'ಂ'); // Labial
      break;
    case 'TELUGU':
      result = result.replace(/ఙ్(?=[కఖగఘ])/g, 'ం');
      result = result.replace(/ಞ్(?=[చఛజఝ])/g, 'ం');
      result = result.replace(/ణ్(?=[టఠడఢ])/g, 'ం');
      result = result.replace(/న్(?=[తథదధ])/g, 'ం');
      result = result.replace(/మ్(?=[పఫబభ])/g, 'ం');
      break;
    case 'GUJARATI':
      result = result.replace(/ઙ્(?=[કખગઘ])/g, 'ં');
      result = result.replace(/ઞ્(?=[ચછજઝ])/g, 'ં');
      result = result.replace(/ણ્(?=[ટઠડઢ])/g, 'ં');
      result = result.replace(/ન્(?=[તથદધ])/g, 'ં');
      result = result.replace(/મ્(?=[પફબભ])/g, 'ં');
      break;
    case 'BENGALI':
      result = result.replace(/ঙ্(?=[কখগঘ])/g, 'ং');
      result = result.replace(/ঞ্(?=[চছজঝ])/g, 'ং');
      result = result.replace(/ণ্(?=[টঠডঢ])/g, 'ং');
      result = result.replace(/ন্(?=[ত্থদধ])/g, 'ং');
      result = result.replace(/ম্(?=[পফবভ])/g, 'ং');
      break;
    case 'GURMUKHI':
      // In Gurmukhi, Bindi (ਂ) is the anusvara equivalent.
      result = result.replace(/ਙ੍(?=[ਕਖਗਘ])/g, 'ਂ');
      result = result.replace(/ਞ੍(?=[ਚਛਜਝ])/g, 'ਂ');
      result = result.replace(/ਣ੍(?=[ਟਠਡਢ])/g, 'ਂ');
      result = result.replace(/ਨ੍(?=[ਤਥਦਧ])/g, 'ਂ');
      result = result.replace(/ਮ੍(?=[ਪਫਬਭ])/g, 'ਂ');
      break;
    case 'MALAYALAM':
      result = result.replace(/ങ്(?=[കഖഗഘ])/g, 'ം');
      result = result.replace(/ஞ்(?=[ചഛജഝ])/g, 'ം');
      result = result.replace(/ണ്(?=[ടഠഡഢ])/g, 'ം');
      result = result.replace(/ന്(?=[തഥദധ])/g, 'ം');
      result = result.replace(/മ്(?=[പഫബഭ])/g, 'ം');
      break;
    case 'TAMIL':
      // Tamil has a more complex orthography. This is an approximation.
      result = result.replace(/ங்(?=[க])/g, 'ஂ');
      result = result.replace(/ஞ்(?=[ச])/g, 'ஂ');
      result = result.replace(/ண்(?=[ട])/g, 'ஂ');
      result = result.replace(/ந்(?=[த])/g, 'ஂ');
      result = result.replace(/ம்(?=[ப])/g, 'ஂ');
      break;
  }
  return result;
}


export const TransliterationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [targetScript, setTargetScriptState] = useState<string>('DEVANAGARI');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedScript = localStorage.getItem('vaikhari-script');
    if (storedScript && SCRIPT_DEFINITIONS[storedScript]) {
      setTargetScriptState(storedScript);
    }
  }, []);

  const setTargetScript = (script: string) => {
    if (SCRIPT_DEFINITIONS[script]) {
      setTargetScriptState(script);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vaikhari-script', script);
      }
    }
  };

  const transliterateText = useCallback((text: string): string => {
    if (!isMounted || !text) {
      return text;
    }
    try {
      // This function assumes the source text is in Devanagari for consistency.
      const fromScheme = 'devanagari';
      const toScheme = SCRIPT_DEFINITIONS[targetScript]?.scheme || 'devanagari';
      
      if (fromScheme === toScheme) {
          return text;
      }
      
      const transliterated = Sanscript.t(text, fromScheme, toScheme);
      // Apply script-specific orthographic fixes for a more natural look.
      return applyOrthographicFixes(transliterated, targetScript);
    } catch (e) {
      console.error('Transliteration failed:', e);
      return text; // Return original text on error
    }
  }, [targetScript, isMounted]);

  const value = {
    targetScript,
    setTargetScript,
    transliterateText
  };

  return (
    <TransliterationContext.Provider value={value}>
      {children}
    </TransliterationContext.Provider>
  );
};
TransliterationProvider.displayName = "TransliterationProvider";

export function useTransliteration() {
  const context = useContext(TransliterationContext);
  if (context === undefined) {
    throw new Error('useTransliteration must be used within a TransliterationProvider');
  }
  return context;
}

export const Transliterate: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { transliterateText, targetScript } = useTransliteration();
    const ref = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) return;

        // Find all elements marked for transliteration by class
        const elementsToTransliterate = node.querySelectorAll('.font-devanagari');
        
        // Use a Set to ensure we process each text node only once
        const processedTextNodes = new Set<Text>();

        elementsToTransliterate.forEach(element => {
            const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
            let n;
            while ((n = walk.nextNode())) {
                const textNode = n as Text;
                if (processedTextNodes.has(textNode)) {
                    continue;
                }
                 // Exclude text within certain interactive elements from being transliterated
                if (textNode.parentElement && textNode.parentElement.closest('[role="tooltip"], button, a, [data-citation]')) {
                    continue;
                }
                
                processedTextNodes.add(textNode);
                
                // Ensure we have an original to work from, and store it if we don't.
                if (!(textNode as any)._original) {
                    (textNode as any)._original = textNode.nodeValue;
                }

                const originalText = (textNode as any)._original;

                if (originalText) {
                    textNode.nodeValue = transliterateText(originalText);
                }
            }
        });

    }, [children, targetScript, transliterateText]);

    return <span ref={ref}>{children}</span>;
}
