
'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { OmIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loginUser, registerUser } from '@/actions/auth.actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope, faPhone, faGraduationCap, faStethoscope, faBuilding, faBriefcase, faKey } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faGoogle, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import './auth.css';
import { Loader2, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';


function SubmitButton({ label, pending }: { label: string, pending?: boolean }) {
    const { pending: isFormPending } = useFormStatus();
    const finalPending = pending !== undefined ? pending : isFormPending;

    return (
        <Button type="submit" className="btn solid" disabled={finalPending}>
            {finalPending ? <Loader2 className="animate-spin" /> : label}
        </Button>
    )
}

// --- Multi-step form components ---

const Step1 = ({ data, setData }: { data: any, setData: Function }) => (
  <div className="w-full max-w-md mx-auto space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div className="input-field"><FontAwesomeIcon icon={faUser} className="input-icon" /><Input placeholder="First Name" name="firstname" value={data.firstname} onChange={(e) => setData({ ...data, firstname: e.target.value })} required /></div>
      <div className="input-field"><FontAwesomeIcon icon={faUser} className="input-icon" /><Input placeholder="Last Name" name="lastname" value={data.lastname} onChange={(e) => setData({ ...data, lastname: e.target.value })} required /></div>
    </div>
    <div className="input-field"><FontAwesomeIcon icon={faPhone} className="input-icon" /><Input placeholder="Phone Number" name="phone" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} required /></div>
    <div className="input-field"><FontAwesomeIcon icon={faEnvelope} className="input-icon" /><Input placeholder="Email" name="email" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required /></div>
    <RadioGroup value={data.professionalRole} onValueChange={(value) => setData({ ...data, professionalRole: value })} className="flex justify-around pt-2">
      <Label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="student" id="role-student" />I am a Student</Label>
      <Label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="doctor" id="role-doctor" />I am a Doctor</Label>
    </RadioGroup>
  </div>
);

const Step2 = ({ data, setData }: { data: any, setData: Function }) => (
  <div className="w-full max-w-md mx-auto space-y-3">
     <div className="flex items-center space-x-2"><Checkbox id="isBams" name="isBams" checked={data.isBams} onCheckedChange={(checked) => setData({...data, isBams: checked})} /><Label htmlFor="isBams">BAMS</Label></div>
      {data.isBams && (
        <div className="pl-6 space-y-3">
            <h4 className="font-semibold">UG Details</h4>
            <div className="input-field"><FontAwesomeIcon icon={faGraduationCap} className="input-icon" /><Input placeholder="UG College Name" name="ugCLgName" value={data.ugCLgName} onChange={e => setData({...data, ugCLgName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
                <div className="input-field !grid-cols-1"><Input placeholder="Pincode" name="ugPincode" value={data.ugPincode} onChange={e => setData({...data, ugPincode: e.target.value})} /></div>
                <div className="input-field !grid-cols-1"><Input placeholder="Batch" name="Batch" value={data.Batch} onChange={e => setData({...data, Batch: e.target.value})} /></div>
            </div>
        </div>
      )}
      <div className="flex items-center space-x-2"><Checkbox id="isMdMs" name="isMdMs" checked={data.isMdMs} onCheckedChange={(checked) => setData({...data, isMdMs: checked})} /><Label htmlFor="isMdMs">MD/MS</Label></div>
      {data.isMdMs && (
        <div className="pl-6 space-y-3">
           <h4 className="font-semibold">PG Details</h4>
           <div className="input-field"><FontAwesomeIcon icon={faGraduationCap} className="input-icon" /><Input placeholder="PG College Name" name="pgClgName" value={data.pgClgName} onChange={e => setData({...data, pgClgName: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
                <div className="input-field !grid-cols-1"><Input placeholder="Pincode" name="pgPinCode" value={data.pgPinCode} onChange={e => setData({...data, pgPinCode: e.target.value})} /></div>
                <div className="input-field !grid-cols-1"><Input placeholder="Specialization" name="specialization" value={data.specialization} onChange={e => setData({...data, specialization: e.target.value})} /></div>
            </div>
        </div>
      )}
  </div>
);

const Step3 = ({ data, setData }: { data: any, setData: Function }) => {
    const isStudent = data.professionalRole === 'student';

    return (
        <div className="w-full max-w-md mx-auto space-y-3">
            {isStudent ? (
                 <div className="input-field !grid-cols-1"><Textarea placeholder="Your Future Plans..." value={data.futurePlan} onChange={e => setData({...data, futurePlan: e.target.value})} name="futurePlan" className="h-24 bg-transparent border-0" /></div>
            ) : (
                <>
                    <div className="flex items-center space-x-2"><Checkbox id="isPracticener" name="isPracticener" checked={data.isPracticener} onCheckedChange={(checked) => setData({ ...data, isPracticener: !!checked })} /><Label htmlFor="isPracticener">Are you a Practitioner?</Label></div>
                    {data.isPracticener ? (
                        <div className="pl-6 space-y-3">
                            <div className="input-field"><FontAwesomeIcon icon={faBriefcase} className="input-icon" /><Input placeholder="Work Type" name="workType" value={data.workType} onChange={e => setData({...data, workType: e.target.value})} /></div>
                            <div className="input-field !grid-cols-1"><Input placeholder="Registration No." name="registerationNo" value={data.registerationNo} onChange={e => setData({...data, registerationNo: e.target.value})} /></div>
                            <div className="input-field"><FontAwesomeIcon icon={faBuilding} className="input-icon" /><Input placeholder="Practice Center Name" name="practiceCenterName" value={data.practiceCenterName} onChange={e => setData({...data, practiceCenterName: e.target.value})} /></div>
                            <div className="input-field !grid-cols-1"><Input placeholder="Practice Center Address" name="practiceCenterAddress" value={data.practiceCenterAddress} onChange={e => setData({...data, practiceCenterAddress: e.target.value})} /></div>
                        </div>
                    ) : (
                        <div className="input-field !grid-cols-1"><Textarea placeholder="Your Future Plans..." name="futurePlan" value={data.futurePlan} onChange={e => setData({...data, futurePlan: e.target.value})} className="h-24 bg-transparent border-0" /></div>
                    )}
                </>
            )}
        </div>
    )
};

const Step4 = ({ data, setData }: { data: any, setData: Function }) => (
    <div className="w-full max-w-md mx-auto space-y-3">
        <div className="input-field"><FontAwesomeIcon icon={faKey} className="input-icon" /><Input type="password" placeholder="Password" name="password" value={data.password} onChange={e => setData({...data, password: e.target.value})} required /></div>
        <div className="input-field"><FontAwesomeIcon icon={faKey} className="input-icon" /><Input type="password" placeholder="Confirm Password" name="confirmPassword" value={data.confirmPassword} onChange={e => setData({...data, confirmPassword: e.target.value})} required /></div>
    </div>
);


const MultiStepSignUpForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        firstname: '', lastname: '', phone: '', email: '', professionalRole: 'student',
        isBams: false, isMdMs: false, ugCLgName: '', ugPincode: '', Batch: '', pgClgName: '', pgPinCode: '', specialization: '',
        isPracticener: false, workType: '', registerationNo: '', practiceCenterName: '', practiceCenterAddress: '', futurePlan: '',
        password: '', confirmPassword: ''
    });

    const [state, formAction] = useActionState(registerUser, null);
    const { toast } = useToast();
    const router = useRouter();

     useEffect(() => {
        if (state?.success) {
            toast({ title: 'Registration Successful!', description: 'You can now log in.' });
            // Potentially switch back to sign-in form automatically here
        }
        if (state?.error) {
            toast({ title: 'Registration Failed', description: state.error, variant: 'destructive' });
        }
    }, [state, toast]);

    const steps = [
        { name: 'Account Info' },
        { name: 'Education' },
        { name: 'Practice Details' },
        { name: 'Set Password' },
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return <Step1 data={formData} setData={setFormData} />;
            case 1: return <Step2 data={formData} setData={setFormData} />;
            case 2: return <Step3 data={formData} setData={setFormData} />;
            case 3: return <Step4 data={formData} setData={setFormData} />;
            default: return null;
        }
    };
    
    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // Append state data to FormData
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                const value = (formData as any)[key];
                if (typeof value === 'boolean') {
                    data.set(key, value ? 'on' : '');
                } else {
                    data.set(key, value);
                }
            }
        }
        formAction(data);
    };

    return (
        <form onSubmit={handleFormSubmit} className="sign-up-form">
            <h2 className="title">Sign up</h2>
            <p className="text-sm text-gray-500 mb-2">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</p>
            
            <div className="my-4 w-full">
                {renderStepContent()}
            </div>
            
            <div className="flex justify-between w-full max-w-md">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back
                </Button>
                {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                        Next <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                ) : (
                    <SubmitButton label="Finish" />
                )}
            </div>
        </form>
    )
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [signInState, signInAction] = useActionState(loginUser, null);

  const [isSignUpMode, setIsSignUpMode] = useState(false);

  useEffect(() => {
    if (signInState?.success && signInState.user) {
      toast({ title: 'Login Successful', description: `Welcome back!` });
      login(signInState.user.token, signInState.user);
      if (signInState.user.isDoctor) {
        router.push('/dashboard');
      } else {
        router.push('/medhayu/profile');
      }
    }
    if (signInState?.error) {
      toast({ title: 'Login Failed', description: signInState.error, variant: 'destructive' });
    }
  }, [signInState, router, login, toast]);


  return (
    <div className={cn("login-container", isSignUpMode && "sign-up-mode")}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign In Form */}
          <form action={signInAction} className="sign-in-form">
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input type="email" name="email" placeholder="Email" required />
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input type="password" name="password" placeholder="Password" required />
            </div>
            <SubmitButton label="Login" />
            <p className="social-text">Or Sign in with social platforms</p>
            <div className="social-media">
              <a href="#" className="social-icon"><FontAwesomeIcon icon={faFacebookF} /></a>
              <a href="#" className="social-icon"><FontAwesomeIcon icon={faTwitter} /></a>
              <a href="#" className="social-icon"><FontAwesomeIcon icon={faGoogle} /></a>
              <a href="#" className="social-icon"><FontAwesomeIcon icon={faLinkedinIn} /></a>
            </div>
          </form>

          {/* Sign Up Form */}
          <MultiStepSignUpForm />
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here ?</h3>
            <p>Join our community of Ayurvedic practitioners and scholars. Sign up to get started.</p>
            <Button className="btn transparent" type="button" onClick={() => setIsSignUpMode(true)}>Sign up</Button>
          </div>
          <img src="https://i.ibb.co/6HXL6q1/Privacy-policy-rafiki.png" className="image" alt="" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>One of us ?</h3>
            <p>Welcome back! Sign in to continue your journey with Ayurvedic wisdom.</p>
            <Button className="btn transparent" type="button" onClick={() => setIsSignUpMode(false)}>Sign in</Button>
          </div>
          <img src="https://i.ibb.co/nP8H853/Mobile-login-rafiki.png" className="image" alt="" />
        </div>
      </div>
    </div>
  );
}
