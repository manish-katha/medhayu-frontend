
export type PostAuthor = {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string;
};

export type Comment = {
  id: string;
  authorId: string;
  timestamp: string;
  body: string;
  title?: string;
  targetText: string | null;
  replies: Comment[];
  reasonTags?: string[];
  feedback: {
      likes: number;
      dislikes: number;
  };
};

export interface LayerAnnotation {
  id: string;
  type: string;
  content: string;
}

export type ContentBlock = {
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
};

export interface ArticleFeedback {
  likes: number;
  dislikes: number;
  insightful: number;
  uplifting: number;
  views: number;
  scores: { value: number; count: number }[];
}

export interface Article {
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

export interface BookStructure {
  id: string;
  name: string;
  levels: {
      name: string;
      subLevels?: { name: string }[];
  }[];
  contentTypes: { id: string, label: string, sanskrit: string }[];
}

export interface Book {
  id: string;
  name: string;
  author?: string;
  description?: string;
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
  volumeInfo?: {
    seriesName: string;
    volumeNumber: number;
  };
  ownerId: string;
}

export interface BookContent extends Omit<Book, 'id' | 'name' | 'author'> {
  bookId: string;
  bookName: string;
  author: string;
  chapters: Chapter[];
  structure?: BookStructure;
}

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

export interface LinkableArticle {
    id: string;
    label: string;
    url: string;
}
