
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Building, Loader2 } from 'lucide-react';
import ClinicCard from '@/components/Settings/Clinic/ClinicCard';
import ClinicForm from '@/components/Settings/Clinic/ClinicForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { getClinicsForUser } from '@/actions/clinic.actions';
import { useAuth } from '@/app/contexts/AuthContext';
import type { Clinic } from '@/types';

const MyClinicsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<any | null>(null);
  const [myClinics, setMyClinics] = useState<Clinic[]>([]);
  const [sharedClinics, setSharedClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Get user from auth context

  const fetchClinics = useCallback(async () => {
    if (!user) return; // Don't fetch if no user
    setIsLoading(true);
    const result = await getClinicsForUser(); // This action uses the logged-in user's session
    if (result.success && result.data) {
        // Separate clinics owned by the user vs. shared with them
        const owned = result.data.filter(c => c.doctorId.toString() === user._id.toString());
        const shared = result.data.filter(c => c.doctorId.toString() !== user._id.toString());
        setMyClinics(owned);
        setSharedClinics(shared);
    }
    setIsLoading(false);
  }, [user]);
  
  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const handleEdit = (clinicId: string) => {
    const allClinics = [...myClinics, ...sharedClinics];
    const clinicToEdit = allClinics.find(c => c.clinicId === clinicId);
    if (clinicToEdit) {
      setEditingClinic(clinicToEdit);
      setIsFormOpen(true);
    }
  };
  
  const handleAddNew = () => {
    setEditingClinic(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClinic(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchClinics(); // Refresh data after a change
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Clinics</h1>
          <p className="text-muted-foreground">
            Manage all your clinic branches from a single dashboard.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Clinic
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="my-clinics">
          <TabsList>
            <TabsTrigger value="my-clinics">My Clinics</TabsTrigger>
            <TabsTrigger value="shared">Shared with me</TabsTrigger>
          </TabsList>
          <TabsContent value="my-clinics" className="pt-4">
            {myClinics.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {myClinics.map((clinic) => (
                        <ClinicCard key={clinic.clinicId} {...clinic} onEdit={handleEdit} />
                    ))}
                </div>
            ) : (
                 <EmptyState
                      icon={<Building />}
                      title="No Clinics Found"
                      description="You haven't created any clinics yet. Get started by adding one."
                      action={{
                          label: "Add New Clinic",
                          onClick: handleAddNew
                      }}
                  />
            )}
          </TabsContent>
          <TabsContent value="shared" className="pt-4">
              {sharedClinics.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {sharedClinics.map((clinic) => (
                          <ClinicCard key={clinic.clinicId} {...clinic} onEdit={handleEdit} />
                      ))}
                  </div>
              ) : (
                  <EmptyState
                      icon={<Building />}
                      title="No Clinics Shared With You"
                      description="When other practitioners share access to their clinics, they will appear here."
                  />
              )}
          </TabsContent>
        </Tabs>
      )}
      
      <ClinicForm 
        open={isFormOpen} 
        onOpenChange={handleCloseForm} 
        onSubmit={handleFormSuccess}
        clinicData={editingClinic}
      />
    </div>
  );
};

export default MyClinicsPage;
