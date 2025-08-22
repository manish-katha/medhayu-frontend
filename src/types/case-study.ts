

import type { CaseStudyFormValues } from "@/components/CaseStudy/Form/formSchema";

export interface CaseStudy extends CaseStudyFormValues {
  id: string;
  date: string;
}
