
'use client';

import React from 'react';
import { LivingDocumentClient } from './living-document-client';
import type { Book, BookContent, GlossaryTerm, Bookmark, BookTheme } from '@/types';

interface LivingDocumentPageProps {
  books: Book[];
  initialBookContent: BookContent | null;
  glossary: GlossaryTerm[];
  bookmarks: Bookmark[];
  selectedBookId: string | null;
  initialTheme: BookTheme;
  defaultTheme: BookTheme;
}

const LivingDocumentPage: React.FC<LivingDocumentPageProps> = (props) => {
    return <LivingDocumentClient {...props} />;
