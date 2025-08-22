

'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { PatientData, Visit, Invoice, LabReport, CaseStudy, PatientProfileData } from '@/types/patient-profile';
import type { Prescription } from '@/types/prescription';
import path from 'path';
import connectToDatabase from '@/lib/db/mongoose';
import Patient from '@/models/patient.model';

const visitsFilePath = path.join(corpusPath, 'visits.json');
const invoicesFilePath = path.join(corpusPath, 'invoices.json');
const labReportsFilePath = path.join(corpusPath, 'lab_reports.json');
const caseStudiesFilePath = path.join(corpusPath, 'case_studies.json');
const prescriptionsFilePath = path.join(corpusPath, 'prescriptions.json');

// This service is now primarily for fetching related data from JSON files.
// Main patient CRUD operations are in patient.actions.ts using MongoDB.

export async function getPatientProfile(patientId: string): Promise<PatientProfileData | null> {
    await connectToDatabase();
    const patientObject = await Patient.findById(patientId);

    if (!patientObject) {
        return null;
    }
    const patient: PatientData = JSON.parse(JSON.stringify(patientObject));

    // For now, related data is still coming from JSON files. This can be migrated later.
    const allVisits = await readJsonFile<Visit[]>(visitsFilePath, []);
    const patientVisits = allVisits
        .filter(v => v.patientId === patient.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const allInvoices = await readJsonFile<Invoice[]>(invoicesFilePath, []);
    const patientInvoices = allInvoices
        .filter(i => i.patientId === patient.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
    const allLabReports = await readJsonFile<LabReport[]>(labReportsFilePath, []);
    const patientLabReports = allLabReports
        .filter(r => r.patientId === patient.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const allCaseStudies = await readJsonFile<CaseStudy[]>(caseStudiesFilePath, []);
    const patientCaseStudies = allCaseStudies.filter(cs => cs.patientId === patient.id);

    const lifetimeValue = patientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
        patient,
        visits: patientVisits,
        invoices: patientInvoices,
        labReports: patientLabReports,
        caseStudies: patientCaseStudies,
        lifetimeValue
    };
}


// --- Prescription Functions (from JSON) ---

export async function getPrescriptionById(id: string): Promise<Prescription | undefined> {
    const prescriptions = await readJsonFile<Prescription[]>(prescriptionsFilePath, []);
    return prescriptions.find(p => p.id === id);
}

export async function getPrescriptionsByPatientId(patientId: number): Promise<Prescription[]> {
    const prescriptions = await readJsonFile<Prescription[]>(prescriptionsFilePath, []);
    return prescriptions
        .filter(p => p.patientId === patientId)
        .sort((a,b) => {
            const dateA = a.id.split('-')[1] ? new Date(a.id.split('-')[1]) : new Date(0);
            const dateB = b.id.split('-')[1] ? new Date(b.id.split('-')[1]) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
}

// --- Visit Functions (from JSON) ---

export async function updateVisit(visitId: number, updates: Partial<Visit>): Promise<Visit> {
    const visits = await readJsonFile<Visit[]>(visitsFilePath, []);
    const visitIndex = visits.findIndex(v => v.id === visitId);

    if (visitIndex === -1) {
        throw new Error('Visit not found');
    }

    const updatedVisit = { ...visits[visitIndex], ...updates };
    visits[visitIndex] = updatedVisit;

    await writeJsonFile(visitsFilePath, visits);
    return updatedVisit;
}
