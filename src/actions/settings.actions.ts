
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import path from 'path';
import { 
    prescriptionSettingsSchema, 
    type PrescriptionSettings, 
    patientIdSettingsSchema, 
    type PatientIdSettings,
    erpSettingsSchema,
    type ErpSettings
} from '@/types/settings';

const prescriptionSettingsFilePath = path.join(corpusPath, 'prescription-settings.json');
const patientIdSettingsFilePath = path.join(corpusPath, 'patient-id-settings.json');
const erpSettingsFilePath = path.join(corpusPath, 'erp-settings.json');


const defaultPrescriptionSettings: PrescriptionSettings = {
    headerAlignment: 'center',
    showLogo: true,
    logoPlacement: 'center',
    showClinicName: true,
    showDoctorName: true,
    addressPlacement: 'header',
    contactPlacement: 'header',
    showAddress: true,
    showContact: true,
    headerBackground: '#f8f8f8',
    textColor: '#333333',
    accentColor: '#1e8a4c',
    fontFamily: 'Inter',
    showFooter: true,
    footerText: 'Thank you for visiting Oshadham Ayurveda. Follow the prescription as directed.',
    showWatermark: true,
    watermarkOpacity: 5,
    headerBorderStyle: 'solid',
    bodyBackground: '#ffffff',
    showSignature: true,
    signaturePlacement: 'right',
    useLetterhead: false,
    enableBarcode: false,
};

const defaultPatientIdSettings: PatientIdSettings = {
    prefix: 'OPDO-',
    nextNumber: 1,
    suffix: '',
};

const defaultErpSettings: ErpSettings = {
    autoNumbering: true,
    clinicName: 'OSH',
    doctorName: 'SHAR',
    invoiceFormat: { prefix: 'INV-', nextNumber: 1, suffix: '' },
    poFormat: { prefix: 'PO-', nextNumber: 1, suffix: '' },
    returnFormat: { prefix: 'SALRE-', nextNumber: 1, suffix: '' },
    trackInventory: true,
    defaultLowStockThreshold: 10,
    expiryAlertDays: 30,
    currency: 'INR',
    defaultPaymentTerms: 'Due on receipt',
    invoiceFooter: 'Thank you for your business!',
    enabledPaymentMethods: ['Cash', 'Card', 'UPI'],
};


export async function getPrescriptionSettings(): Promise<PrescriptionSettings> {
    return readJsonFile<PrescriptionSettings>(prescriptionSettingsFilePath, defaultPrescriptionSettings);
}

export async function savePrescriptionSettings(data: PrescriptionSettings): Promise<{ success: boolean }> {
    try {
        const validatedData = prescriptionSettingsSchema.parse(data);
        await writeJsonFile(prescriptionSettingsFilePath, validatedData);
        return { success: true };
    } catch (error) {
        console.error('Validation failed or could not save settings:', error);
        throw new Error('Failed to save prescription settings.');
    }
}

export async function getPatientIdSettings(): Promise<PatientIdSettings> {
    return readJsonFile<PatientIdSettings>(patientIdSettingsFilePath, defaultPatientIdSettings);
}

export async function savePatientIdSettings(data: PatientIdSettings): Promise<{ success: boolean; error?: string }> {
    try {
        const validatedData = patientIdSettingsSchema.parse(data);
        await writeJsonFile(patientIdSettingsFilePath, validatedData);
        return { success: true };
    } catch (error: any) {
        console.error('Validation failed or could not save patient ID settings:', error);
        return { success: false, error: 'Failed to save patient ID settings.' };
    }
}


export async function getErpSettings(): Promise<ErpSettings> {
    return readJsonFile<ErpSettings>(erpSettingsFilePath, defaultErpSettings);
}

export async function saveErpSettings(data: ErpSettings): Promise<{ success: boolean, error?: any }> {
    try {
        const validatedData = erpSettingsSchema.parse(data);
        await writeJsonFile(erpSettingsFilePath, validatedData);
        return { success: true };
    } catch (error) {
        console.error('Validation failed or could not save ERP settings:', error);
        return { success: false, error: (error as any).flatten() };
    }
}
