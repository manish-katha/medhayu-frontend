

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Visit } from '@/types/patient-profile';
import { format } from 'date-fns';
import { getPrescriptionById } from '@/services/patient.service';
import { GeneratedPrescriptionContent } from '@/components/prescription/GeneratedPrescription';
import { getPatientById } from '@/actions/patient.actions';
import { PatientData } from '@/types/patient';
import { Loader2 } from 'lucide-react';
import { Prescription } from '@/types/prescription';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface VisitsTabProps {
  visits: Visit[];
}

const VisitsTab: React.FC<VisitsTabProps> = ({ visits }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewPrescription = async (prescriptionId: string, patientId: number) => {
    setIsLoading(true);
    setIsDialogOpen(true);
    try {
      const [prescriptionData, patientData] = await Promise.all([
        getPrescriptionById(prescriptionId),
        getPatientById(patientId.toString())
      ]);
      
      if (prescriptionData && patientData) {
        setSelectedPrescription(prescriptionData);
        setSelectedPatient(patientData);
      } else {
        // Handle case where data is not found
        console.error("Prescription or Patient not found");
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to fetch prescription details", error);
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPrescription(null);
    setSelectedPatient(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.length > 0 ? visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{format(new Date(visit.date), 'dd MMM, yyyy')}</TableCell>
                  <TableCell>{visit.doctor}</TableCell>
                  <TableCell>{visit.diagnosis}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPrescription(visit.prescriptionId, visit.patientId)}
                      >
                        View Prescription
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No visit history found.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              {isLoading 
                ? "Loading prescription..." 
                : `Viewing prescription for ${selectedPatient?.name} from ${selectedPrescription ? format(new Date(selectedPrescription.nextVisitDate || Date.now()), 'PPP') : ''}.`
              }
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-100/50">
                {selectedPrescription && selectedPatient && (
                  <GeneratedPrescriptionContent
                    patient={selectedPatient}
                    medicines={selectedPrescription.medicines}
                    diagnosticTests={selectedPrescription.diagnosticTests}
                    specialInstructions={selectedPrescription.specialInstructions}
                    dietInstructions={selectedPrescription.dietInstructions}
                    nextVisitDate={selectedPrescription.nextVisitDate ? new Date(selectedPrescription.nextVisitDate) : undefined}
                  />
                )}
              </div>
              <DialogFooter className="p-4 border-t bg-background">
                <Button variant="outline" onClick={closeDialog}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VisitsTab;
