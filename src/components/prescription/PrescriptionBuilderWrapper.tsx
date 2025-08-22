
import React from 'react';
import PrescriptionBuilder, { Medicine } from './PrescriptionBuilder';
import { PatientData } from '@/types/patient';

interface PrescriptionBuilderWrapperProps {
  selectedPatient: PatientData | null;
  onBack?: () => void;
}

const PrescriptionBuilderWrapper: React.FC<PrescriptionBuilderWrapperProps> = ({
  selectedPatient,
  onBack,
}) => {
    const [medicines, setMedicines] = React.useState<Medicine[]>([]);
    const [diagnosticTests, setDiagnosticTests] = React.useState<string[]>([]);

  return (
    <div className="prescription-builder-wrapper">
      <PrescriptionBuilder 
        selectedPatient={selectedPatient}
        onBack={onBack}
        medicines={medicines}
        setMedicines={setMedicines}
        diagnosticTests={diagnosticTests}
        setDiagnosticTests={setDiagnosticTests}
      />
    </div>
  );
};

export default PrescriptionBuilderWrapper;
