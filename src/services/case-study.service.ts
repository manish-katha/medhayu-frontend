

'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { CaseStudy } from '@/types/case-study';
import path from 'path';

const caseStudiesFilePath = path.join(corpusPath, 'case_studies.json');

export async function getCaseStudies(): Promise<CaseStudy[]> {
    return readJsonFile<CaseStudy[]>(caseStudiesFilePath, []);
}

export async function getCaseStudyById(id: string): Promise<CaseStudy | undefined> {
    const caseStudies = await getCaseStudies();
    return caseStudies.find(cs => cs.id === id);
}

export async function getCaseStudiesByPatient(patientId: number): Promise<CaseStudy[]> {
    const allCaseStudies = await getCaseStudies();
    return allCaseStudies.filter(cs => cs.patientId === patientId);
}

export async function addCaseStudy(caseStudyData: Omit<CaseStudy, 'id' | 'date'>): Promise<CaseStudy> {
    const caseStudies = await getCaseStudies();
    const newCaseStudy: CaseStudy = {
        id: `cs-${Date.now()}`,
        date: new Date().toISOString(),
        ...caseStudyData,
    };
    caseStudies.unshift(newCaseStudy);
    await writeJsonFile(caseStudiesFilePath, caseStudies);
    return newCaseStudy;
}

export async function updateCaseStudy(id: string, updates: Partial<CaseStudy>): Promise<CaseStudy> {
    const caseStudies = await getCaseStudies();
    const studyIndex = caseStudies.findIndex(cs => cs.id === id);
    if (studyIndex === -1) {
        throw new Error('Case study not found');
    }
    const updatedStudy = { ...caseStudies[studyIndex], ...updates };
    caseStudies[studyIndex] = updatedStudy;
    await writeJsonFile(caseStudiesFilePath, caseStudies);
    return updatedStudy;
}
