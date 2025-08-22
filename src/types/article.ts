

import type { UserProfile } from './user.types';
import type { Citation } from './citation';

export type StandaloneArticleType = 'article' | 'abstract' | 'whitepaper' | 'case-study';

export interface WhitepaperContent {
    subtitle?: string;
    authors?: Partial<UserProfile>[];
    executiveSummary: string;
    introduction?: string;
    problemStatement?: string;
    proposedSolution?: string;
    classicalFramework?: string;
    modernContext?: string;
    implementationStrategy?: string;
    observations?: string;
    discussion?: string;
    challenges?: string;
    conclusion?: string;
    references?: Citation[];
    appendices?: string;
}

export interface StandaloneArticle {
  id: string;
  title: string;
  content: string | WhitepaperContent;
  type: StandaloneArticleType;
  categoryId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StandaloneArticleCategory {
  id: string;
  name: string;
}
