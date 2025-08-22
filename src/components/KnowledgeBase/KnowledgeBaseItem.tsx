
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, BookOpen, ThumbsUp, FileText } from 'lucide-react';

interface KnowledgeBaseItemProps {
  id: string;
  title: string;
  type: 'sop' | 'diet' | 'classical' | 'case-study';
  description: string;
  dateAdded: string;
  author: string;
  tags: string[];
  approvedBy?: string;
  usageCount?: number;
  onView?: (id: string) => void;
}

const KnowledgeBaseItem = ({
  id,
  title,
  type,
  description,
  dateAdded,
  author,
  tags,
  approvedBy,
  usageCount = 0,
  onView
}: KnowledgeBaseItemProps) => {
  const typeConfig = {
    'sop': { 
      icon: <FileText size={16} />,
      label: 'SOP',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    'diet': { 
      icon: <Book size={16} />,
      label: 'Diet Protocol',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    'classical': { 
      icon: <BookOpen size={16} />,
      label: 'Classical Reference',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    'case-study': { 
      icon: <ThumbsUp size={16} />,
      label: 'Case Study',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium flex-grow">{title}</CardTitle>
          <Badge className={`flex items-center gap-1 ${typeConfig[type].color}`}>
            {typeConfig[type].icon}
            <span>{typeConfig[type].label}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-0 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <div>Added by {author} • {dateAdded}</div>
          {approvedBy && <div>Approved by {approvedBy}</div>}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4 border-t mt-4">
        <div className="text-sm text-muted-foreground">
          Used {usageCount} {usageCount === 1 ? 'time' : 'times'}
        </div>
        <Button variant="outline" size="sm" onClick={() => onView && onView(id)}>
          <BookOpen size={14} className="mr-1" /> View
        </Button>
      </CardFooter>
    </Card>
  );
};

export default KnowledgeBaseItem;
