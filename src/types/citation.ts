
export interface Citation {
  refId: string;
  source: string;
  location?: string;
  sanskrit: string;
  english: string;
  keywords: string[];
}

export interface CitationCategory {
  id: string;
  name: string;
  citations: Citation[];
}
