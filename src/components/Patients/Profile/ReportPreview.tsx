
'use client';

import React from 'react';
import { ExtractedLabData } from '@/ai/flows/extract-lab-report-data';
import { analyzeLabReport } from '@/ai/flows/analyze-lab-report';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { useCopilot } from '@/hooks/use-copilot.tsx';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReportPreviewProps {
  data: ExtractedLabData;
  reportDate: string;
}

// Simple markdown to HTML converter
const markdownToHtml = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>') // H3 for sections like FINDINGS
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>')         // Italic
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>') // Unordered list
      .replace(/<\/ul>\n<li/gm, '</li><li') // Fix extra space between list items
      .replace(/\n/g, '<br />'); // Newlines
  };

const ReportPreview: React.FC<ReportPreviewProps> = ({ data, reportDate }) => {
  const { openCopilotPanel, setAnalysis } = useCopilot();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const hasResults = data.testResults && data.testResults.length > 0;
  const hasSummary = !!data.summary;
  const formattedDate = format(new Date(reportDate), 'PPP');
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeLabReport({
        reportType: data.reportType,
        reportSummary: data.summary || JSON.stringify(data.testResults),
      });
      setAnalysis(analysisResult);
      openCopilotPanel();
    } catch (error: any) {
        console.error("Analysis failed:", error);
        toast({
            title: "Analysis Failed",
            description: "The AI could not analyze the report. Please try again.",
            variant: "destructive"
        })
    } finally {
        setIsAnalyzing(false);
    }
  };


  if (!hasResults && !hasSummary) {
    return (
        <div className="h-full flex items-center justify-center">
            <EmptyState
                icon={<FileText />}
                title="No Parseable Data Found"
                description={`No structured data could be extracted from the report dated ${formattedDate}.`}
            />
        </div>
    )
  }
  
  const cardHeaderContent = (title: string) => (
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Date of Report: {formattedDate}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="mr-2 h-4 w-4" />
            )}
            Analyze with AI
        </Button>
      </CardHeader>
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      {hasResults ? (
         <Card className="flex-1 flex flex-col overflow-hidden">
            {cardHeaderContent("Parsed Test Results")}
            <CardContent className="flex-1 overflow-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Reference Range</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {data.testResults.map((result, index) => (
                        <TableRow key={index}>
                        <TableCell className="font-medium">{result.testName}</TableCell>
                        <TableCell>{result.value}</TableCell>
                        <TableCell>{result.unit}</TableCell>
                        <TableCell>{result.referenceRange}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
         </Card>
      ) : (
        <Card className="flex-1 flex flex-col overflow-hidden">
            {cardHeaderContent("Extracted Report Text")}
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(data.summary!) }}
                    />
                </ScrollArea>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportPreview;
