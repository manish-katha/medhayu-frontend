
import React from 'react';
import { PatientData } from '@/types/patient';
import { User, Cake, VenetianMask, Phone, Mail, MapPin, Stethoscope } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PatientInfoCardProps {
  patient: PatientData;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => {
  const patientDetails = [
    { icon: <User size={14} />, label: patient.name },
    { icon: <Cake size={14} />, label: `${patient.age} years` },
    { icon: <VenetianMask size={14} />, label: patient.gender },
    { icon: <Phone size={14} />, label: patient.phone },
  ];

  const medicalDetails = [
    patient.email ? { icon: <Mail size={14} />, label: patient.email } : null,
    patient.address ? { icon: <MapPin size={14} />, label: patient.address } : null,
    patient.chiefComplaint ? { icon: <Stethoscope size={14} />, label: `Complaint: ${patient.chiefComplaint}` } : null,
    patient.condition ? { icon: <Stethoscope size={14} />, label: `Condition: ${patient.condition}` } : null,
  ].filter(Boolean);

  return (
    <div className="mt-4 w-full rounded-lg border-none bg-gradient-to-r from-ayurveda-green to-ayurveda-ochre p-3 text-sm animate-hue-rotate shadow-lg">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {patientDetails.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center gap-2 text-white">
              <span className="text-white/70">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            {index < patientDetails.length - 1 && <Separator orientation="vertical" className="h-4 bg-white/30" />}
          </React.Fragment>
        ))}
        {medicalDetails.length > 0 && <Separator orientation="vertical" className="h-4 hidden md:block bg-white/30" />}
        {medicalDetails.map((item, index) => item && (
             <div key={`medical-${index}`} className="flex items-center gap-2 text-white hidden md:flex">
              <span className="text-white/70">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default PatientInfoCard;
