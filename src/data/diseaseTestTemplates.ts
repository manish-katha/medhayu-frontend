

export interface DiseaseTemplate {
  name: string;
  aliases: string[];
  tests: string[];
}

export const diseaseTestTemplates: DiseaseTemplate[] = [
    // General Medicine/Internal Medicine
    { name: "Diabetes Mellitus", aliases: ["Madhumeha", "Sugar", "Diabetes"], tests: ["FBS", "PPBS", "HbA1c", "OGTT"] },
    { name: "Hypertension", aliases: ["Rakta Gata Vata", "High BP", "High Blood Pressure"], tests: ["BP Monitoring", "Fundoscopy", "ECG", "RFT"] },
    { name: "Hypothyroidism", aliases: ["Underactive Thyroid"], tests: ["TSH", "Free T3", "Free T4"] },
    { name: "Hyperthyroidism", aliases: ["Overactive Thyroid"], tests: ["TSH", "Free T3", "Free T4", "TSI"] },
    { name: "Anemia", aliases: ["Pandu"], tests: ["CBC", "Peripheral Smear", "Iron Studies"] },
    { name: "Vitamin D Deficiency", aliases: [], tests: ["Serum 25(OH) Vitamin D"] },
    { name: "Viral Fever", aliases: ["Jwara"], tests: ["CBC", "ESR", "Dengue NS1/IgM", "Widal", "Malaria Parasite"] },
    { name: "Rheumatoid Arthritis", aliases: ["Amavata"], tests: ["RA Factor", "Anti-CCP", "CRP", "ESR"] },
    { name: "Systemic Lupus Erythematosus", aliases: ["SLE"], tests: ["ANA Profile", "dsDNA Antibody"] },
    { name: "Chronic Fatigue Syndrome", aliases: [], tests: ["CBC", "TSH", "ESR", "LFT", "Vitamin D", "Ferritin"] },

    // Cardiology
    { name: "Ischemic Heart Disease", aliases: ["IHD", "Heart Blockage"], tests: ["ECG", "TMT", "ECHO", "Troponin I/T"] },
    { name: "Heart Failure", aliases: ["Congestive Heart Failure"], tests: ["ECHO", "BNP/NT-proBNP", "Chest X-ray"] },
    { name: "Arrhythmias", aliases: ["Irregular Heartbeat"], tests: ["ECG", "Holter Monitoring", "ECHO"] },

    // Pulmonology
    { name: "Bronchial Asthma", aliases: ["Tamaka Shwasa"], tests: ["Spirometry", "Peak Flow Meter"] },
    { name: "COPD", aliases: ["Chronic Obstructive Pulmonary Disease"], tests: ["Spirometry", "Chest X-ray"] },
    { name: "Tuberculosis", aliases: ["Rajayakshma", "TB"], tests: ["CXR", "Sputum AFB", "GeneXpert", "ESR", "Mantoux"] },
    { name: "Interstitial Lung Disease", aliases: ["ILD"], tests: ["HRCT Chest"] },
    { name: "Pleural Effusion", aliases: ["Fluid in lungs"], tests: ["Chest X-ray", "USG Thorax", "Pleural Fluid Analysis"] },

    // Gastroenterology
    { name: "Gastritis/GERD", aliases: ["Amlapitta", "Hyperacidity"], tests: ["UGI Endoscopy", "H. pylori Test"] },
    { name: "Fatty Liver Disease", aliases: ["Yakrit Roga"], tests: ["USG Abdomen", "LFT"] },
    { name: "Hepatitis B/C", aliases: [], tests: ["HBsAg", "Anti-HCV", "LFT", "Viral Load"] },
    { name: "Irritable Bowel Syndrome", aliases: ["Grahani", "IBS"], tests: ["Rule-out: Stool Test", "Colonoscopy (if needed)"] },
    { name: "Inflammatory Bowel Disease", aliases: ["IBD", "Crohn's", "Ulcerative Colitis"], tests: ["Colonoscopy + Biopsy", "CRP", "Fecal Calprotectin"] },

    // Nephrology
    { name: "Acute Kidney Injury", aliases: ["AKI"], tests: ["RFT (Urea, Creatinine, Electrolytes)", "USG Abdomen"] },
    { name: "Chronic Kidney Disease", aliases: ["CKD"], tests: ["RFT", "Urine ACR", "eGFR", "USG Kidneys"] },
    { name: "Nephrotic Syndrome", aliases: [], tests: ["Urine Protein", "Lipid Profile", "Serum Albumin"] },
    { name: "Urinary Tract Infection", aliases: ["UTI"], tests: ["Urine Routine", "Urine C/S", "USG Abdomen"] },
    { name: "Renal Stones", aliases: ["Mutrashmari", "Kidney Stones"], tests: ["NCCT KUB", "USG Abdomen", "Urine Routine"] },

    // Neurology
    { name: "Stroke", aliases: ["Pakshaghata"], tests: ["CT Brain", "MRI Brain", "Carotid Doppler"] },
    { name: "Epilepsy", aliases: ["Apasmara", "Seizures"], tests: ["EEG", "MRI Brain"] },
    { name: "Parkinson's Disease", aliases: ["Kampavata"], tests: ["Clinical", "MRI Brain", "DaT Scan (if needed)"] },
    { name: "Migraine", aliases: ["Ardhavabhedaka"], tests: ["Clinical Diagnosis", "MRI Brain (if red flags)"] },
    { name: "Peripheral Neuropathy", aliases: [], tests: ["NCV", "EMG", "Vitamin B12", "HbA1c"] },

    // Orthopedics
    { name: "Osteoarthritis", aliases: ["Sandhigata Vata"], tests: ["X-ray Joint", "CRP"] },
    { name: "Osteoporosis", aliases: [], tests: ["DEXA Scan", "Vitamin D", "Calcium"] },
    { name: "Low Back Pain", aliases: ["Katishula"], tests: ["X-ray", "MRI LS Spine"] },
    { name: "Fractures", aliases: ["Asthi Bhagna"], tests: ["X-ray", "CT Scan (if complex)"] },

    // Dermatology
    { name: "Fungal Infections", aliases: ["Dadru"], tests: ["KOH Mount", "Wood's Lamp"] },
    { name: "Psoriasis", aliases: ["Kitibha"], tests: ["Clinical", "Skin Biopsy (if uncertain)"] },
    { name: "Eczema", aliases: ["Vicharchika"], tests: ["Clinical", "Patch Test (if allergic suspected)"] },
    { name: "Leprosy", aliases: ["Kushtha"], tests: ["Slit Skin Smear", "Biopsy"] },
    { name: "Vitiligo", aliases: ["Shvitra", "Leucoderma"], tests: ["Wood’s Lamp", "ANA (if suspected autoimmune)"] },

    // Gynecology
    { name: "Polycystic Ovarian Syndrome", aliases: ["PCOS"], tests: ["USG Pelvis", "LH/FSH", "AMH", "Insulin", "Testosterone"] },
    { name: "Uterine Fibroids", aliases: ["Granthi"], tests: ["USG Pelvis"] },
    { name: "Menorrhagia", aliases: ["Asrigdara", "Heavy Menstrual Bleeding"], tests: ["CBC", "USG Pelvis", "Thyroid Profile"] },
    { name: "Infertility", aliases: ["Vandhyatva"], tests: ["Hormonal Profile", "HSG", "TVS", "Semen Analysis"] },
    { name: "Endometriosis", aliases: [], tests: ["USG", "MRI Pelvis", "Diagnostic Laparoscopy"] },

    // ENT
    { name: "Otitis Media", aliases: ["Karna Shula", "Middle Ear Infection"], tests: ["Otoscopy", "Audiometry"] },
    { name: "Sinusitis", aliases: ["Pratishyaya"], tests: ["X-ray PNS", "CT PNS"] },
    { name: "Deviated Nasal Septum", aliases: ["DNS"], tests: ["Anterior Rhinoscopy", "CT PNS"] },
    { name: "Allergic Rhinitis", aliases: [], tests: ["Clinical Diagnosis", "IgE Levels"] },

    // Ophthalmology
    { name: "Cataract", aliases: ["Timira", "Linganasha"], tests: ["Slit Lamp Examination"] },
    { name: "Glaucoma", aliases: [], tests: ["IOP Measurement", "Perimetry", "Fundoscopy"] },
    { name: "Diabetic Retinopathy", aliases: [], tests: ["Fundoscopy", "OCT Retina"] },
    { name: "Refractive Errors", aliases: [], tests: ["Visual Acuity Test", "Refraction"] },

    // Psychiatry
    { name: "Depression", aliases: ["Avasada"], tests: ["PHQ-9", "Psychiatric Evaluation"] },
    { name: "Anxiety Disorders", aliases: ["Chittodvega"], tests: ["GAD-7", "Psychiatric Evaluation"] },
    { name: "Schizophrenia", aliases: ["Unmada"], tests: ["Psychiatric Assessment"] },
    { name: "Dementia", aliases: ["Smriti Nasha"], tests: ["MMSE", "MRI Brain"] },
    { name: "Bipolar Disorder", aliases: [], tests: ["Psychiatric Evaluation"] }
];
