

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import PatientProfile from '@/components/Patients/Profile/PatientProfile';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { getPatientById } from '@/actions/patient.actions';

interface PatientProfilePageProps {
    params: {
        id: string;
    };
}

const PatientProfilePage = async (props: PatientProfilePageProps) => {
    const params = use(props.params);
    
    // Fetch the patient using the server action that connects to MongoDB
    const patient = await getPatientById(params.id);

    if (!patient) {
        notFound();
    }
    
    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                    <BreadcrumbLink href="/patients">Patients</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbPage>{patient.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <PatientProfile patientId={patient.id} />
        </div>
    );
};

export default PatientProfilePage;
