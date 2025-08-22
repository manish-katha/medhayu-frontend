
'use client';

import { useLanguage, SUPPORTED_LANGUAGES } from '@/components/language-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LanguageSwitcher() {
  const { targetLang, setTargetLang } = useLanguage();

  return (
      <Select value={targetLang} onValueChange={setTargetLang}>
        <SelectTrigger id="lang-switcher" className="w-[150px] h-9">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
}
