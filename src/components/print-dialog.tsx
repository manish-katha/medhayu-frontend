
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArticleRenderer } from './article-renderer';
import { Printer } from 'lucide-react';
import type { BookContent, Chapter, Article } from '@/types';

interface PrintDialogProps {
  children: React.ReactNode;
  articleInfo: {
    book: BookContent;
    chapter: Chapter;
    article: Article;
  } | null;
}

export function PrintDialog({ children, articleInfo }: PrintDialogProps) {
    
    const handlePrint = () => {
        const printContent = document.getElementById('printable-content');
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Print</title>');
                // You might want to link to your app's stylesheet or a print-specific one
                const styles = Array.from(document.styleSheets)
                    .map(styleSheet => {
                        try {
                            return Array.from(styleSheet.cssRules)
                                .map(rule => rule.cssText)
                                .join('');
                        } catch (e) {
                            return '';
                        }
                    })
                    .join('');
                printWindow.document.write('<style>');
                printWindow.document.write(styles);
                printWindow.document.write('</style></head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Print Preview</DialogTitle>
          <DialogDescription>
            This is a preview of how the article will look when printed.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 bg-muted">
            <div id="printable-content" className="p-8 bg-white text-black">
                 {articleInfo && (
                    <div className="prose prose-lg max-w-none">
                        <h1>{articleInfo.article.title}</h1>
                        <h2>From "{articleInfo.book.bookName}", Chapter: {articleInfo.chapter.name}</h2>
                        <ArticleRenderer blocks={articleInfo.article.content} />
                    </div>
                )}
            </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t">
          <DialogClose asChild>
             <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
