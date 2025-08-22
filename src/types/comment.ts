
export interface Comment {
  id: string;
  authorId: string;
  timestamp: string;
  body: string;
  title?: string;
  targetText: string | null;
  replies: Comment[];
}
