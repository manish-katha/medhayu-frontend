'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OmIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from '@/hooks/use-toast';
import { login } from '@/actions/signin.action';  // ⬅️ your API call (pure client-side)
import { registerUser } from '@/actions/signin.action'; // if you keep API-based register
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope, faPhone, faGraduationCap, faStethoscope, faBuilding, faBriefcase, faKey } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faGoogle, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import './auth.css';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { setSession } from '@/utils/common/authHelper';

function SubmitButton({ label, pending }) {
  return (
    <Button type="submit" className="btn solid" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : label}
    </Button>
  )
}

// ------------------ Multi-step Signup ------------------
const Step1 = ({ data, setData }) => (
  <div className="w-full max-w-md mx-auto space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div className="input-field"><FontAwesomeIcon icon={faUser} className="input-icon" /><Input placeholder="First Name" value={data.firstname} onChange={(e) => setData({ ...data, firstname: e.target.value })} required /></div>
      <div className="input-field"><FontAwesomeIcon icon={faUser} className="input-icon" /><Input placeholder="Last Name" value={data.lastname} onChange={(e) => setData({ ...data, lastname: e.target.value })} required /></div>
    </div>
    <div className="input-field"><FontAwesomeIcon icon={faPhone} className="input-icon" /><Input placeholder="Phone Number" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} required /></div>
    <div className="input-field"><FontAwesomeIcon icon={faEnvelope} className="input-icon" /><Input placeholder="Email" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required /></div>
    <RadioGroup value={data.professionalRole} onValueChange={(value) => setData({ ...data, professionalRole: value })} className="flex justify-around pt-2">
      <Label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="student" />I am a Student</Label>
      <Label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="doctor" />I am a Doctor</Label>
    </RadioGroup>
  </div>
);

const Step2 = ({ data, setData }) => (
  <div className="w-full max-w-md mx-auto space-y-3">
    <div className="flex items-center space-x-2"><Checkbox checked={data.isBams} onCheckedChange={(checked) => setData({...data, isBams: checked})} /><Label>BAMS</Label></div>
    {data.isBams && (
      <div className="pl-6 space-y-3">
        <h4 className="font-semibold">UG Details</h4>
        <div className="input-field"><FontAwesomeIcon icon={faGraduationCap} className="input-icon" /><Input placeholder="UG College Name" value={data.ugCLgName} onChange={e => setData({...data, ugCLgName: e.target.value})} /></div>
      </div>
    )}
  </div>
);

const Step3 = ({ data, setData }) => (
  <div className="w-full max-w-md mx-auto space-y-3">
    {data.professionalRole === 'student' ? (
      <div className="input-field"><Textarea placeholder="Your Future Plans..." value={data.futurePlan} onChange={e => setData({...data, futurePlan: e.target.value})} /></div>
    ) : (
      <div className="input-field"><Input placeholder="Practice Center Name" value={data.practiceCenterName} onChange={e => setData({...data, practiceCenterName: e.target.value})} /></div>
    )}
  </div>
);

const Step4 = ({ data, setData }) => (
  <div className="w-full max-w-md mx-auto space-y-3">
    <div className="input-field"><FontAwesomeIcon icon={faKey} className="input-icon" /><Input type="password" placeholder="Password" value={data.password} onChange={e => setData({...data, password: e.target.value})} required /></div>
    <div className="input-field"><FontAwesomeIcon icon={faKey} className="input-icon" /><Input type="password" placeholder="Confirm Password" value={data.confirmPassword} onChange={e => setData({...data, confirmPassword: e.target.value})} required /></div>
  </div>
);

const MultiStepSignUpForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', phone: '', email: '', professionalRole: 'student',
    isBams: false, practiceCenterName: '', futurePlan: '',
    password: '', confirmPassword: ''
  });
  const router = useRouter();
  const { login: saveAuth } = useAuth();

  const { toast } = useToast();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(formData);
      if (res.success) {
        // toast({ title: 'Registration Successful!', description: 'You can now log in.' });
        saveAuth(res.token, res.data);
         setSession(res.token);
        router.push('/medhayu/profile');
      } else {
        toast({ title: 'Registration Failed', description: res.error, variant: 'destructive' });
        router.push('/medhayu/profile');
      }
    } catch (err) {
      console.log("login error",err)
      // toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="sign-up-form">
      <h2 className="title">Sign up</h2>
      {currentStep === 0 && <Step1 data={formData} setData={setFormData} />}
      {currentStep === 1 && <Step2 data={formData} setData={setFormData} />}
      {currentStep === 2 && <Step3 data={formData} setData={setFormData} />}
      {currentStep === 3 && <Step4 data={formData} setData={setFormData} />}

      <div className="flex justify-between mt-4">
        <Button type="button" variant="outline" onClick={() => setCurrentStep(s => Math.max(s - 1, 0))} disabled={currentStep === 0}>
          <ArrowLeft className="mr-2 h-4 w-4"/> Back
        </Button>
        {currentStep < 3 ? (
          <Button type="button" onClick={() => setCurrentStep(s => Math.min(s + 1, 3))}>
            Next <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        ) : (
          <SubmitButton label="Finish" />
        )}
      </div>
    </form>
  )
}

// ------------------ Main Page ------------------
export default function LoginPage() {
  const router = useRouter();
  const { login: saveAuth } = useAuth();
  const { toast } = useToast();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await login(email, password);
      console.log("res",res) // ⬅️ your API call
      if (res.success) {
        // toast({ title: 'Login Successful', description: 'Welcome back!' });
        setSession(res.token);
        saveAuth(res.token, res.data);
        if (res.data.isDoctor) {
          // router.push('/dashboard');
          router.push('/medhayu/profile');
        } else {
          router.push('/medhayu/profile');
        }
      }
    } catch (err) {
      console.log("login error",err)
      // toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("login-container", isSignUpMode && "sign-up-mode")}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="sign-in-form">
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input type="email" name="email" placeholder="Email" required />
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input type="password" name="password" placeholder="Password" required />
            </div>
            <SubmitButton label="Login" pending={loading} />
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
