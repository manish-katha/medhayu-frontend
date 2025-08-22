
import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { SaveIcon, RefreshCcw } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define schema for the form
const formSchema = z.object({
  // General Information
  name: z.string().min(2, { message: "Name is required" }),
  age: z.coerce.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  occupation: z.string().optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  phoneNumber: z.string().min(10),
  email: z.string().email().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  referredBy: z.string().optional(),
  
  // Roga Rogi Pariksha
  doshaPredominance: z.array(z.string()).min(1),
  shariraPrakriti: z.array(z.string()).min(1),
  manasPrakriti: z.enum(["sattva", "rajas", "tamas"]),
  currentDoshaImbalance: z.array(z.string()).min(1),
  durationOfCondition: z.string(),
  symptomsObserved: z.string(),
  agni: z.enum(["vishama", "tikshna", "manda", "sama"]),
  koshta: z.enum(["krura", "madhya", "mrudu"]),
  affectedDhatus: z.array(z.string()),
  
  // Kayachikitsa
  primaryComplaint: z.string(),
  ama: z.enum(["present", "absent"]),
  symptomsOfAma: z.string().optional(),
  srotasAffected: z.string().optional(),
  jwara: z.enum(["yes", "no", "intermittent", "continuous"]),
  shulaDescription: z.string().optional(),
  appetiteThirstPattern: z.enum(["normal", "increased", "decreased"]),
  sleepPattern: z.enum(["sound", "disturbed", "insomnia"]),
  mentalHealthCondition: z.enum(["anxious", "depressed", "normal"]),
  
  // Lifestyle
  dietaryPreferences: z.enum(["vegetarian", "non-vegetarian", "mixed"]),
  mealFrequency: z.enum(["1", "2", "3", "more"]),
  exerciseRoutine: z.enum(["regular", "irregular", "none"]),
  exerciseDetails: z.string().optional(),
  sleepSchedule: z.enum(["regular", "irregular", "insomnia"]),
  hoursOfSleep: z.string(),
  
  // Patient Goals
  primaryHealthGoal: z.string(),
  treatmentExpectations: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const AyurvedicResearchForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "male",
      maritalStatus: "single",
      doshaPredominance: [],
      shariraPrakriti: [],
      manasPrakriti: "sattva",
      currentDoshaImbalance: [],
      agni: "sama",
      koshta: "madhya",
      affectedDhatus: [],
      ama: "absent",
      jwara: "no",
      appetiteThirstPattern: "normal",
      sleepPattern: "sound",
      mentalHealthCondition: "normal",
      dietaryPreferences: "mixed",
      mealFrequency: "3",
      exerciseRoutine: "regular",
      sleepSchedule: "regular",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log("Form submitted:", values);
    // Here you would save the patient data
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-ayurveda-green/5 border-b">
        <CardTitle className="text-ayurveda-green">Ayurvedic Medical History Research Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold text-ayurveda-brown border-b pb-2">1. General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="male" id="male" />
                            <label htmlFor="male" className="text-sm">Male</label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="female" id="female" />
                            <label htmlFor="female" className="text-sm">Female</label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="other" id="other" />
                            <label htmlFor="other" className="text-sm">Other</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referred By</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold text-ayurveda-brown border-b pb-2">2. Roga Rogi Pariksha (Patient Examination)</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">A. Prakriti (Constitutional Assessment)</h3>
                
                <FormField
                  control={form.control}
                  name="doshaPredominance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosha Predominance</FormLabel>
                      <div className="flex space-x-4">
                        {["Vata", "Pitta", "Kapha"].map(dosha => (
                          <div key={dosha} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`dosha-${dosha}`} 
                              checked={field.value.includes(dosha.toLowerCase())}
                              onCheckedChange={(checked) => {
                                const newValue = checked 
                                  ? [...field.value, dosha.toLowerCase()]
                                  : field.value.filter(d => d !== dosha.toLowerCase());
                                field.onChange(newValue);
                              }}
                            />
                            <label htmlFor={`dosha-${dosha}`}>{dosha}</label>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shariraPrakriti"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sharira Prakriti (Physical Constitution)</FormLabel>
                      <div className="flex space-x-4">
                        {["Vata", "Pitta", "Kapha", "Mixed"].map(type => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`sharira-${type}`} 
                              checked={field.value.includes(type.toLowerCase())}
                              onCheckedChange={(checked) => {
                                const newValue = checked 
                                  ? [...field.value, type.toLowerCase()]
                                  : field.value.filter(t => t !== type.toLowerCase());
                                field.onChange(newValue);
                              }}
                            />
                            <label htmlFor={`sharira-${type}`}>{type}</label>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="manasPrakriti"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manas Prakriti (Mental Constitution)</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="sattva" id="sattva" />
                            <label htmlFor="sattva" className="text-sm">Sattva</label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="rajas" id="rajas" />
                            <label htmlFor="rajas" className="text-sm">Rajas</label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <RadioGroupItem value="tamas" id="tamas" />
                            <label htmlFor="tamas" className="text-sm">Tamas</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">B. Vikriti (Current Imbalance)</h3>

                <FormField
                  control={form.control}
                  name="currentDoshaImbalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Dosha Imbalance (Vikriti)</FormLabel>
                      <div className="flex space-x-4">
                        {["Vata", "Pitta", "Kapha", "Mixed"].map(type => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`vikriti-${type}`} 
                              checked={field.value.includes(type.toLowerCase())}
                              onCheckedChange={(checked) => {
                                const newValue = checked 
                                  ? [...field.value, type.toLowerCase()]
                                  : field.value.filter(t => t !== type.toLowerCase());
                                field.onChange(newValue);
                              }}
                            />
                            <label htmlFor={`vikriti-${type}`}>{type}</label>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="durationOfCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration of Condition</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symptomsObserved"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms Observed</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agni (Digestive Fire)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select agni type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vishama">Vishama (Irregular)</SelectItem>
                          <SelectItem value="tikshna">Tikshna (Sharp)</SelectItem>
                          <SelectItem value="manda">Manda (Weak)</SelectItem>
                          <SelectItem value="sama">Sama (Balanced)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="koshta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Koshta (Bowel Nature)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select koshta type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="krura">Krura (Hard)</SelectItem>
                          <SelectItem value="madhya">Madhya (Medium)</SelectItem>
                          <SelectItem value="mrudu">Mrudu (Soft)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="affectedDhatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affected Dhatus (Tissues)</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Rasa", "Rakta", "Mamsa", "Medas", "Asthi", "Majja", "Shukra"].map(dhatu => (
                          <div key={dhatu} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`dhatu-${dhatu}`} 
                              checked={field.value.includes(dhatu.toLowerCase())}
                              onCheckedChange={(checked) => {
                                const newValue = checked 
                                  ? [...field.value, dhatu.toLowerCase()]
                                  : field.value.filter(d => d !== dhatu.toLowerCase());
                                field.onChange(newValue);
                              }}
                            />
                            <label htmlFor={`dhatu-${dhatu}`}>{dhatu}</label>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold text-ayurveda-brown border-b pb-2">3. Kayachikitsa (General Medicine)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Complaint</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ama (Toxins)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symptomsOfAma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptoms of Ama</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="srotasAffected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Srotas Affected</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jwara"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jwara (Fever)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="intermittent">Intermittent</SelectItem>
                          <SelectItem value="continuous">Continuous</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shulaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shula (Pain Description)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appetiteThirstPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appetite & Thirst Pattern</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="increased">Increased</SelectItem>
                          <SelectItem value="decreased">Decreased</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sleepPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep Pattern</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sound">Sound</SelectItem>
                          <SelectItem value="disturbed">Disturbed</SelectItem>
                          <SelectItem value="insomnia">Insomnia</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mentalHealthCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mental Health Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="anxious">Anxious</SelectItem>
                          <SelectItem value="depressed">Depressed</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold text-ayurveda-brown border-b pb-2">4. Lifestyle and Goals</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dietaryPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preferences</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mealFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Frequency (per day)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="more">More</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exerciseRoutine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Routine</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="irregular">Irregular</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exerciseDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Details</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sleepSchedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep Schedule</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="irregular">Irregular</SelectItem>
                          <SelectItem value="insomnia">Insomnia</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hoursOfSleep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours of Sleep (Average)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="primaryHealthGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Health Goal</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="treatmentExpectations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Expectations</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <CardFooter className="flex justify-between border-t pt-5">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset Form
              </Button>
              <Button type="submit" className="bg-ayurveda-green hover:bg-ayurveda-green/90">
                <SaveIcon className="mr-2 h-4 w-4" /> Save Patient Details
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AyurvedicResearchForm;
