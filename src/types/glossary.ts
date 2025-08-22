
export interface GlossaryTerm {
  term: string;
  definition: string;
  aliases?: string[];
}

export interface GlossaryCategory {
  id: string;
  name: string;
  scope: 'global' | 'local';
  colorTheme: 'saffron' | 'blue' | 'green' | 'gray';
  terms: GlossaryTerm[];
}
