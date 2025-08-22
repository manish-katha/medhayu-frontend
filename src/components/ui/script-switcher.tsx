
'use client';

import { useTransliteration, SCRIPT_DEFINITIONS } from '@/components/transliteration-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';

const INDIC_SCRIPTS = ['DEVANAGARI', 'KANNADA', 'TELUGU', 'TAMIL', 'MALAYALAM', 'GUJARATI', 'BENGALI', 'GURMUKHI'];
const ROMAN_SCRIPTS = ['IAST', 'ITRANS', 'HK', 'SLP1'];

export function ScriptSwitcher() {
  const { targetScript, setTargetScript } = useTransliteration();

  return (
      <Select value={targetScript} onValueChange={setTargetScript}>
        <SelectTrigger id="script-switcher" className="w-[180px] h-9">
          <SelectValue placeholder="Select script" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Indic Scripts</SelectLabel>
            {INDIC_SCRIPTS.map(scriptKey => (
              <SelectItem key={scriptKey} value={scriptKey}>
                {SCRIPT_DEFINITIONS[scriptKey].label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
             <SelectLabel>Roman Phonetic</SelectLabel>
            {ROMAN_SCRIPTS.map(scriptKey => (
              <SelectItem key={scriptKey} value={scriptKey}>
                {SCRIPT_DEFINITIONS[scriptKey].label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
  );
}
