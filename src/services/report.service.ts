
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { LabReport } from '@/types/patient-profile';
import path from 'path';

const labReportsFilePath = path.join(corpusPath, 'lab_reports.json');

export async function getReports(): Promise<LabReport[]> {
    return readJsonFile<LabReport[]>(labReportsFilePath, []);
}

export async function getReport(id: number): Promise<LabReport | undefined> {
    const reports = await getReports();
    return reports.find(report => report.id === id);
}

export async function addReport(reportData: Omit<LabReport, 'id'>): Promise<LabReport> {
    const reports = await getReports();
    const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
    const newReport: LabReport = {
        id: newId,
        ...reportData,
    };
    reports.unshift(newReport);
    await writeJsonFile(labReportsFilePath, reports);
    return newReport;
}


export async function deleteReport(id: number): Promise<void> {
    let reports = await getReports();
    reports = reports.filter(report => report.id !== id);
    await writeJsonFile(labReportsFilePath, reports);
}
