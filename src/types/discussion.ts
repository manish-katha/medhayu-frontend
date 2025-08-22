
import { z } from 'zod';
import { UserProfile } from './user.types';

export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string;
}

export interface DebateEntry {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  stance: 'purvapaksha' | 'uttarpaksha'; // New field for argument stance
}

export interface ManthanaThread {
    id: string;
    topic: string;
    purvapaksha: DebateEntry;
    uttarpaksha: DebateEntry[];
}

export interface Answer {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  references?: string[];
}

export interface Discussion {
  id: string;
  author: Author;
  title: string;
  content: string;
  tags: string[];
  category: string;
  type: 'general' | 'debate';
  createdAt: string;
  answers: Answer[];
  manthana?: ManthanaThread[];
  views: number;
  upvotes: number;
  downvotes: number;
}

// Schema for the "Ask a Question" form
export const questionFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters long."),
  content: z.string().min(20, "Question body must be at least 20 characters long."),
  tags: z.array(z.string()).min(1, "Please add at least one tag.").max(5, "You can add up to 5 tags."),
  category: z.string().min(1, "Please select a category."),
  type: z.enum(['general', 'debate']),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

// Schema for the "Answer" form
export const answerFormSchema = z.object({
  discussionId: z.string(),
  content: z.string().min(10, "Answer must be at least 10 characters long."),
  references: z.array(z.string()).optional(),
});

export type AnswerFormValues = z.infer<typeof answerFormSchema>;

// Schema for Manthana request form
export const manthanaRequestSchema = z.object({
    discussionId: z.string(),
    topic: z.string().min(5, "Debate topic is required."),
    purvapaksha: z.string().min(10, "The initial argument (Purvapaksha) is required."),
});

export type ManthanaRequestValues = z.infer<typeof manthanaRequestSchema>;

// Schema for Uttara Paksha form
export const uttaraPakshaSchema = z.object({
  discussionId: z.string(),
  threadId: z.string(),
  content: z.string().min(10, "Argument must be at least 10 characters long."),
  stance: z.enum(['purvapaksha', 'uttarpaksha']), // Add stance to form validation
});

export type UttaraPakshaFormValues = z.infer<typeof uttaraPakshaSchema>;
