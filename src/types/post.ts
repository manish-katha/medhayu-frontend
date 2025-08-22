

import type { PostAuthor } from './user.types';
import type { Book, StandaloneArticle, CaseStudy } from './';

export interface DravyaData {
  name: string;
  botanicalName: string;
  rasa?: string[];
  guna?: string[];
  veerya?: string;
  vipaka?: string;
  prabhava?: string;
  karma?: string;
  partUsed?: string;
  formulationUse?: string;
  imageUrl?: string;
  discussion?: string; // New field for rich text content
}

export type PostType = 
  | 'thought' 
  | 'question' 
  | 'dravyaguna' 
  | 'case-study' 
  | 'shloka'
  | 'dinacharya'
  | 'tips'
  | 'formulation'
  | 'event'
  | 'poll'
  | 'teacher-insight'
  | 'book';


export interface AttachedWork {
    type: 'book' | 'book-article' | 'case-study' | 'article' | 'whitepaper';
    href: string;
    title: string;
    parentTitle?: string;
    description?: string;
    coverUrl?: string;
    profileUrl?: string;
}

export interface Post {
  id: string;
  postType: PostType;
  author: PostAuthor;
  content: string;
  dravyaData?: DravyaData;
  attachedWork?: AttachedWork;
  createdAt: string;
  circleId?: string;
  status?: 'raw' | 'thread-started';
}
