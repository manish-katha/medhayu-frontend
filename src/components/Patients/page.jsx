'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Loader2, Grid, List, ArrowUpDown, Trash2, MoreVertical } from 'lucide-react';
import PatientCard from '@/components/Patients/PatientCard';
import PatientForm from '@/components/Patients/PatientForm';
import PatientFilters from '@/components/Patients/PatientFilters';
import { EmptyState } from '@/components/ui/empty-state';
import { getPatients } from '@/actions/patient.action';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {  deletePatient } from '@/actions/patient.action';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import DeleteConfirmationDialog from '@/components/Patients/Profile/DeleteConfirmationDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const PatientCardSkeleton = () => (
  <Card className="p-4">
    <div className="flex items-center">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="ml-4 space-y-2 flex-grow">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="mt-3 flex justify-end space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </Card>
);

const PatientsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);

  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const { toast } = useToast();
  const [view, setView] = useState('grid');
  const router = useRouter();

  const [patientToDelete, setPatientToDelete] = useState(null);

  const fetchPatients = useCallback(async (page = 1) => {
    setIsLoading(true);
    const genderFilter = selectedFilters.find(f => ['Male', 'Female', 'Other'].includes(f));
    const ageFilter = selectedFilters.find(f => !['Male', 'Female', 'Other'].includes(f));

    const result = await getPatients(page, 10, { gender: genderFilter, age: ageFilter });

    if (result.success && result.data) {
      setPatients(result.data.patients);
      setTotalPages(result.data.totalPages);
      setCurrentPage(result.data.currentPage);
      setTotalPatients(result.data.totalPatients);
    } else {
      toast({ title: "Error fetching patients", description: result.error, variant: "destructive" });
    }
    setIsLoading(false);
  }, [selectedFilters, toast]);

  useEffect(() => {
    fetchPatients(currentPage);
  }, [fetchPatients, currentPage]);

  const handleNewVisit = (e, patient) => {
    e.stopPropagation();
    toast({
      title: "New visit created",
      description: `Starting new consultation for ${patient.name}`,
    });

    const params = new URLSearchParams({
      patientName: patient.name,
      patientAge: patient.age.toString(),
      patientGender: patient.gender,
      patientId: patient.id.toString(),
      isNewVisit: 'true'
    });
    router.push(`/prescriptions?${params.toString()}`);
  };

  const handleRowClick = (patientId,e) => {
  e.stopPropagation(); // ✅ prevent click bubbling
    e.preventDefault();
    console.log("handle Row click ")
    router.push(`/patients/${patientId}`);
  };

  const handlePatientCreated = () => {
    setIsFormOpen(false);
    fetchPatients();
  };

  const handleAddNewPatient = async () => {
    setIsFormOpen(true);
  };

  const openDeleteDialog = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) setPatientToDelete(patient);
  };
const openEditForm=(patientId)=>{
  console.log("openEditForm",patientId)
  router.push(`/patients/edit/${patientId}`)
}
  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    const result = await deletePatient(patientToDelete.id);
    if (result.success) {
      toast({
        title: "Patient Deleted",
        description: `${patientToDelete.name} has been permanently deleted.`,
      });
      fetchPatients();
    } else {
      toast({
        title: "Deletion Failed",
        description: result.error,
        variant: "destructive",
      });
    }
    setPatientToDelete(null);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Patient Management</h1>
            <p className="text-muted-foreground">
              View, search, and manage your patient records.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddNewPatient} disabled={isGeneratingId}>
              {isGeneratingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              New Patient
            </Button>
            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <PatientFilters
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
          onClear={() => setSelectedFilters([])}
        />

        {isLoading ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <PatientCardSkeleton key={i} />)}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        ) : filteredPatients.length > 0 ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  {...patient}
        
                  onEdit={()=>openEditForm(patient.id)}
                  onDelete={()=> openDeleteDialog(patient.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]"><Button variant="ghost" size="sm"><ArrowUpDown className="mr-2 h-4 w-4" />Patient ID</Button></TableHead>
                      <TableHead><Button variant="ghost" size="sm"><ArrowUpDown className="mr-2 h-4 w-4" />Name</Button></TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead><Button variant="ghost" size="sm"><ArrowUpDown className="mr-2 h-4 w-4" />Last Visit</Button></TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map(patient => (
                      <TableRow key={patient.id} onClick={(e) => handleRowClick(patient.id)} className="cursor-pointer">
                        <TableCell className="font-mono text-xs">{patient.ouid}</TableCell>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>
                          {patient.condition && (
                            <Badge variant="outline" className="bg-ayurveda-green/10 text-ayurveda-green border-ayurveda-green/20">
                              {patient.condition}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{patient.lastVisit ? format(new Date(patient.lastVisit), 'dd MMM, yyyy') : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-ayurveda-green hover:bg-ayurveda-green/90 h-8"
                              onClick={(e) => handleNewVisit(e, patient)}
                            >
                              <Plus size={14} className="mr-1" /> New Visit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDeleteDialog(patient.id) }} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                  <Trash2 size={14} className="mr-2" />
                                  Delete Patient
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPatients.length} of {totalPatients} patients.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchPatients(currentPage - 1)} disabled={currentPage <= 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => fetchPatients(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
                </div>
              </CardFooter>
            </Card>
          )
        ) : (
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="No patients found"
            description="There are no patients matching your current search or filters. Try adjusting your criteria or adding a new patient."
            action={{
              label: "Clear Filters",
              onClick: () => {
                setSearchQuery('');
                setSelectedFilters([]);
              }
            }}
          />
        )}

        <PatientForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmitSuccess={handlePatientCreated}
        />
      </div>
      {patientToDelete && (
        <DeleteConfirmationDialog
          isOpen={!!patientToDelete}
          onOpenChange={() => setPatientToDelete(null)}
          onConfirm={handleDeleteConfirm}
          resourceName={patientToDelete.name}
          resourceType="patient record"
        />
      )}
    </>
  );
};

export default PatientsPage;
