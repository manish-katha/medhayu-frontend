

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LabReport } from '@/types/patient-profile';
import { format } from 'date-fns';
import { FileText, Upload, Loader2, Wand2, Save, MoreVertical, Trash2, Eye, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { extractLabReportData, ExtractedLabData } from '@/ai/flows/extract-lab-report-data';
import ReportPreview from './ReportPreview';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { addReport, deleteReport } from '@/services/report.service';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { extractPdfText } from '@/ai/flows/extract-pdf-text';


interface ReportsTabProps {
  initialReports: LabReport[];
  patientId: string;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ initialReports, patientId }) => {
  const [reports, setReports] = useState(initialReports);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();
  const [view, setView] = useState<'upload' | 'preview'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedLabData | null>(null);
  const [reportName, setReportName] = useState('');
  const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [reportToDelete, setReportToDelete] = useState<LabReport | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);


  useEffect(() => {
    // Clean up the object URL when the component unmounts or the URL changes
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfPreviewUrl(url);
      setReportName(file.name.replace('.pdf', ''));
    } else {
      setPdfPreviewUrl(null);
      setReportName('');
    }
  }

  const processFileWithAI = async () => {
    if (!selectedFile) {
        toast({ title: 'Please select a file first.', variant: 'destructive' });
        return;
    }
    
    setIsProcessing(true);
    
    try {
        // Convert file to data URI
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = async () => {
            const pdfDataUri = reader.result as string;
            
            // Step 1: Extract text from PDF
            const textResult = await extractPdfText({ pdfDataUri });
            if (!textResult || !textResult.extractedText) {
              throw new Error("AI could not extract text from the PDF.");
            }
            
            // Step 2: Extract structured data from the text
            const dataResult = await extractLabReportData({ reportText: textResult.extractedText });
            
            setExtractedData(dataResult);
            if (dataResult.reportType) {
                setReportName(dataResult.reportType);
            }
            setView('preview');
            toast({ title: 'Report Processed', description: 'AI has extracted data from your PDF.' });
            setIsProcessing(false);
        };
        reader.onerror = () => {
            throw new Error("Failed to read the file.");
        };

    } catch (error: any) {
        console.error("Failed to extract data with AI:", error);
        toast({ title: "AI Extraction Failed", description: error.message, variant: "destructive"});
        setIsProcessing(false);
    }
  };


  const handleSave = async (option: 'all' | 'pdf' | 'results') => {
    if (!reportName) {
        toast({ title: "Report name is required", variant: 'destructive'});
        return;
    }
    // In a real app, fileUrl would come from a file storage service like S3 or Firebase Storage
    const newReportData: Omit<LabReport, 'id'> = {
        patientId: parseInt(patientId),
        name: reportName,
        date: reportDate,
        fileUrl: (option === 'all' || option === 'pdf') && selectedFile ? `/uploads/reports/${selectedFile.name}` : undefined,
        results: (option === 'all' || option === 'results') ? extractedData?.testResults : undefined,
        summary: (option === 'all' || option === 'results') ? extractedData?.summary : undefined,
    };

    try {
        const savedReport = await addReport(newReportData);
        setReports(prev => [savedReport, ...prev]);
        
        let description = '';
        switch(option) {
            case 'all': description = `The ${reportName} report and its parsed data have been saved.`; break;
            case 'results': description = `The parsed results for ${reportName} have been saved.`; break;
            case 'pdf': description = `The PDF for ${reportName} have been saved.`; break;
        }
        toast({
            title: "Report Saved",
            description: description,
        });
        closeDialog();
    } catch(error: any) {
        toast({ title: "Failed to save report", description: error.message, variant: 'destructive' });
    }
  };
  
  const closeDialog = () => {
      setIsUploadOpen(false);
      setTimeout(() => {
        setView('upload');
        setExtractedData(null);
        setReportName('');
        setReportDate(format(new Date(), 'yyyy-MM-dd'));
        setSelectedFile(null);
        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
            setPdfPreviewUrl(null);
        }
      }, 300);
  }

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    try {
        await deleteReport(reportToDelete.id);
        setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
        toast({ title: "Report Deleted", description: `Report ${reportToDelete.name} has been deleted.` });
    } catch (error: any) {
        toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
    }
    setReportToDelete(null);
  };

  const handleDownload = (fileUrl: string) => {
    console.log(`Downloading file from: ${fileUrl}`);
    toast({
        title: "Download Started",
        description: "Your file download will begin shortly.",
    });
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Lab Reports</CardTitle>
        <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
            <Upload size={16} className="mr-2"/> Upload New Report
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Key Findings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium flex items-center gap-2">
                    <FileText size={16} className="text-muted-foreground"/>
                    {report.name}
                </TableCell>
                <TableCell>{format(new Date(report.date), 'dd MMM, yyyy')}</TableCell>
                <TableCell>
                  {report.results && report.results.length > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {report.results.slice(0, 2).map(r => `${r.testName}: ${r.value} ${r.unit}`).join('; ')}
                      {report.results.length > 2 ? '...' : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Narrative report</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/reports/${report.id}`)}>
                        <Eye size={14} />
                    </Button>
                    {report.fileUrl && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(report.fileUrl!)}>
                            <Download size={14} />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReportToDelete(report)}>
                        <Trash2 size={14} className="text-destructive" />
                    </Button>
                </TableCell>
              </TableRow>
            )) : (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No lab reports found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={isUploadOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
            {view === 'upload' && (
                <>
                <DialogHeader>
                    <DialogTitle>Upload New Lab Report</DialogTitle>
                    <DialogDescription>
                        Upload a patient's lab report in PDF format. The system will attempt to extract the data automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow flex flex-col items-center justify-center gap-6 p-8 border-2 border-dashed rounded-lg">
                    <div className="flex-1 text-center space-y-2">
                        <Upload size={48} className="text-muted-foreground mx-auto" />
                        <Input 
                            type="file" 
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="max-w-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            {selectedFile ? `Selected: ${selectedFile.name}` : "Select a PDF file to process."}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                     <Button 
                        onClick={processFileWithAI}
                        disabled={isProcessing || !selectedFile}
                    >
                         {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Process with AI
                    </Button>
                </DialogFooter>
                </>
            )}

            {view === 'preview' && (
                <>
                <DialogHeader>
                    <DialogTitle>Parsed Report Preview: {reportName}</DialogTitle>
                    <DialogDescription>
                       Review the data extracted by the AI. You can edit this information later.
                    </DialogDescription>
                </DialogHeader>
                 <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                    <div className="col-span-1 border rounded-lg overflow-hidden">
                        {pdfPreviewUrl ? (
                            <iframe src={pdfPreviewUrl} className="w-full h-full" title="PDF Preview" />
                        ) : (
                             <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground italic">
                                Original PDF preview is not available for manual entries.
                            </div>
                        )}
                    </div>
                    <div className="col-span-1 overflow-hidden">
                        {extractedData && <ReportPreview data={extractedData} reportDate={reportDate} />}
                    </div>
                 </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setView('upload')}>Back to Upload</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <Save size={16} className="mr-2"/>
                                Save Options
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSave('all')}>
                                Save Report & Results
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSave('results')}>
                                Save Results Only
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleSave('pdf')}>
                                Save PDF Only
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </DialogFooter>
                </>
            )}
        </DialogContent>
    </Dialog>
     {reportToDelete && (
        <DeleteConfirmationDialog
            isOpen={!!reportToDelete}
            onOpenChange={() => setReportToDelete(null)}
            onConfirm={handleDeleteConfirm}
            resourceName={`report "${reportToDelete.name}"`}
            resourceType="report"
        />
    )}
    </>
  );
};

export default ReportsTab;
