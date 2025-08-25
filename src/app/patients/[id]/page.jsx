"use client";

import React from "react";
import { notFound } from "next/navigation";
import PatientProfile from "@/components/Patients/Profile/PatientProfile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getPatient } from "@/actions/patient.action";

const PatientProfilePage = async ({ params }) => {
  // ✅ no need for `use(props.params)` (that's for React experimental API)
  const patient = await getPatient(params.id);

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumbs */}
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

      {/* Patient Profile Component */}
      <PatientProfile patientId={params.id} />
    </div>
  );
};

export default PatientProfilePage;
