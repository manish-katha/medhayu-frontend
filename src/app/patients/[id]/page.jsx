"use client"
import React, { use } from 'react';
import { notFound } from 'next/navigation';
import PatientProfile from '@/components/Patients/Profile/PatientProfile';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getPatient } from '@/actions/patient.action';

const PatientProfilePage = async (props) => {
  const params = use(props.params);
  console.log("params",params)
  // Fetch the patient using the server action that connects to MongoDB
  const patient = await getPatient(params.id);
  console.log("patient",patient)
  if (!patient) 
    {
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
