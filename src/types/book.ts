

import type { Comment } from './comment';
import type { PostAuthor } from './user.types';

export interface BookCategory {
  id: string;
  name: string;
}

export interface VolumeInfo {
  seriesName: string;
  volumeNumber: number;
}

export const BOOK_SUBJECTS = [
    { id: 'shastra-samhita', label: 'Śāstra / Saṃhitā' },
    { id: 'translation-annotations', label: 'Translation & Annotations' },
    { id: 'research-publication', label: 'Research Publication' },
    { id: 'puranic-grantha', label: 'Puranic Grantha' },
    { id: 'modern-literature', label: 'Modern Literature' },
];


export interface Book {
  id: string;
  name: string;
  author?: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  subtitle?: string;
  publisher?: string;
  isbn?: string;
  designer?: string;
  subject?: string;
  visibility: 'private' | 'circle' | 'public';
  circleIds?: string[];
  isAnnounced: boolean;
  profileUrl?: string;
  coverUrl?: string;
  volumeInfo?: VolumeInfo;
  ownerId: string;
}

export interface SeriesGroup {
    seriesName: string;
    description: string;
    volumes: Book[];
}

export interface GroupedBook {
    categoryName: string;
    series: SeriesGroup[];
    standaloneBooks: Book[];
}


export interface ContentBlock {
  id: string;
  type: string; // E.g., 'shloka', 'bhashya', 'gadya', etc.
  sanskrit: string;
  translations?: Record<string, string>;
  originalLang?: 'sa' | 'en' | 'hi';
  commentary?: {
    type: string;
    author: string;
    workName: string;
    shortName: string;
  };
  sparks?: {
    id: string;
    content: string;
    authorId: string;
  }[];
  layers?: LayerAnnotation[];
  points?: {
    id: string;
    targetArticle: string; // URL or identifier for the linked article/block
    comment: string;
  }[];
}

export interface LayerAnnotation {
  id: string;
  type: string;
  content: string;
}


export interface ArticleFeedback {
  likes: number;
  dislikes: number;
  insightful: number;
  uplifting: number;
  views: number;
  scores: { value: number; count: number }[];
}

export interface Article {
  id?: string; // Made optional as it's not always present in old data
  verse: string | number;
  title: string;
  content: ContentBlock[];
  comments?: Comment[];
  tags?: string[];
  status?: 'draft' | 'published';
  author: PostAuthor;
  createdAt: number;
    updatedAt: number;
    feedback?: ArticleFeedback;
}

export interface Chapter {
  id: string | number;
  name: string;
  topic?: string;
  articles: Article[];
  children?: Chapter[];
}

export interface BookContent extends Omit<Book, 'id' | 'name' | 'author' > {
  bookId: string;
  bookName: string;
  author: string;
  chapters: Chapter[];
  structure?: BookStructure;
}

export type BookStructure = {
  id: string;
  name: string;
  levels: {
      name: string;
      subLevels?: { name: string }[];
  }[];
  contentTypes: { id: string, label: string, sanskrit: string }[];
};


export interface Bookmark {
  id: string;
  userId: string;
  type: 'article' | 'block';
  bookId: string;
  chapterId: string;
  verse: string;
  blockId?: string;
  blockTextPreview?: string;
  note?: string;
  createdAt: string;
  bookName: string;
  articleTitle: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  type: 'personal' | 'organization';
  category: 'clinical' | 'shastra' | 'institutional';
  ownerId: string;
  members: {
    userId: string;
    name: string;
    avatarUrl: string;
    role: 'admin' | 'moderator' | 'member' | 'reader';
  }[];
  requests: any[]; // Define request structure if needed
  createdAt: number;
  avatarUrl?: string;
  privacy?: 'public' | 'private' | 'invite-only';
  rules?: string;
}

export type StyleProperty = {
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  backgroundColor?: string;
  border?: string;
  padding?: string;
  fontFamily?: string;
};

export type ThemeStyles = {
  [key: string]: StyleProperty;
  h1: StyleProperty;
  h2: StyleProperty;
  h3: StyleProperty;
  h4: StyleProperty;
  h5: StyleProperty;
  h6: StyleProperty;
  paragraph: StyleProperty;
  sutra: StyleProperty;
  bhashya: StyleProperty;
  teeka: StyleProperty;
  citation: StyleProperty;
  quotation: StyleProperty;
  version: StyleProperty;
  footnote: StyleProperty;
  specialNote: StyleProperty;
  toc: StyleProperty;
};

export interface BookTheme {
  bookId: string;
  themeName?: string;
  isDefault?: boolean;
  styles: Partial<ThemeStyles>;
}
