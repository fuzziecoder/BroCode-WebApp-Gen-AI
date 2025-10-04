
import React, { useState } from 'react';
// FIX: Use namespace import for react-router-dom to address potential module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Smartphone, User, AtSign } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import OtpInput from '../components/common/OtpInput';
import AvatarPicker from '../components/common/AvatarPicker';

type FormData = {
  // Common
  loginPassword: string;
  newPassword: string;
  otp: string;
  // Email Auth
  loginEmail: string;
  resetEmail: string;
  // Mobile Auth
  loginMobile: string;
  mobileNumber: string; // Used for registration
  // Profile Setup
  name: string;
  username: string;
  profile_pic_url: string;
};

const LoginPage: React.FC = () => {
  // Common state
  const { login } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // View management
  const [authMethod, setAuthMethod] = useState<'email' | 'mobile'>('email');
  const [view, setView] = useState<'login' | 'forgot' | 'reset' | 'mobile-register' | 'mobile-verify' | 'mobile-setup'>('login');

  const [formData, setFormData] = useState<FormData>({
    loginEmail: '',
    loginPassword: '',
    loginMobile: '',
    resetEmail: '',
    mobileNumber: '',
    otp: '',
    newPassword: '',
    name: '',
    username: '',
    profile_pic_url: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const clearMessages = () => {
    setApiError(null);
    setSuccess(null);
    setErrors({});
  };

  const handleViewChange = (newView: typeof view) => {
    clearMessages();
    setView(newView);
    if (newView === 'login' && authMethod === 'email' && formData.resetEmail) {
      setFormData(f => ({ ...f, loginEmail: f.resetEmail, resetEmail: '' }));
    }
  };

  const handleAuthMethodChange = (method: 'email' | 'mobile') => {
    clearMessages();
    setAuthMethod(method);
    setView('login');
  };

  const validateField = (name: keyof FormData, value: string): string => {
    let error = '';
    switch (name) {
      case 'loginEmail':
      case 'resetEmail':
        if (!value) error = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid.';
        break;
      case 'loginPassword':
      case 'newPassword':
        if (!value) error = 'Password is required.';
        else if (value.length < 6) error = 'Password must be at least 6 characters.';
        break;
      case 'loginMobile':
      case 'mobileNumber':
        if (!value) error = 'Mobile number is required.';
        else if (!/^\d{10}$|^\d{3}-?\d{3}-?\d{4}$/.test(value.replace(/[\s-]/g, ''))) error = 'Invalid mobile number format.';
        break;
      case 'otp':
        if (!value) error = 'Verification code is required.';
        else if (value.length !== 6) error = 'Code must be 6 digits.';
        break;
      case 'name':
        if (!value.trim()) error = 'Name is required.';
        break;
      case 'username':
        if (!value.trim()) error = 'Username is required.';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Username can only contain letters, numbers, and underscores.';
        break;
    }
    return error;
  };

  const validateForm = (fields: Array<keyof FormData>): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof FormData; value: string };
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleOtpChange = (value: string) => {
    setFormData(prev => ({ ...prev, otp: value }));
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: validateField('otp', value) }));
    }
  };
  
  const handleAvatarChange = (url: string) => {
    setFormData(prev => ({ ...prev, profile_pic_url: url }));
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof FormData; value: string };
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const fieldsToValidate: Array<keyof FormData> = authMethod === 'email' ? ['loginEmail', 'loginPassword'] : ['loginMobile', 'loginPassword'];
    if (!validateForm(fieldsToValidate)) return;

    setLoading(true);
    const identifier = authMethod === 'email' ? formData.loginEmail : formData.loginMobile;
    
    try {
      await login(identifier, formData.loginPassword);
      navigate('/dashboard/home');
    } catch (err: any) {
      setApiError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!validateForm(['resetEmail'])) return;

    setLoading(true);
    try {
      await mockApi.sendPasswordResetOtp(formData.resetEmail);
      setSuccess(`A verification code has been sent to ${formData.resetEmail}. (Hint: it's 123456)`);
      handleViewChange('reset');
    } catch (err: any) {
      setApiError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!validateForm(['otp', 'newPassword'])) return;

    setLoading(true);
    try {
      await mockApi.resetPassword(formData.resetEmail, formData.newPassword);
      setSuccess('Password has been reset successfully! Please log in with your new password.');
      handleViewChange('login');
      setFormData(f => ({ ...f, loginEmail: f.resetEmail, loginPassword: '', resetEmail: '', newPassword: '', otp: '' }));
    } catch (err: any)      {
        setApiError(err.message || 'Failed to reset password.');
    } finally {
        setLoading(false);
    }
  };

  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!validateForm(['mobileNumber'])) return;

    setLoading(true);
    try {
        await mockApi.sendMobileOtp(formData.mobileNumber);
        setSuccess(`An OTP has been sent to ${formData.mobileNumber}. (Hint: it's 123456)`);
        handleViewChange('mobile-verify');
    } catch(err: any) {
        setApiError(err.message || 'Failed to send OTP.');
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!validateForm(['otp'])) return;
    
    setLoading(true);
    try {
        const profile = await mockApi.verifyOtp(formData.mobileNumber, formData.otp);
        setFormData(prev => ({
            ...prev,
            name: profile.name,
            username: profile.username,
            profile_pic_url: profile.profile_pic_url || '',
        }));
        setSuccess('Mobile number verified!');
        handleViewChange('mobile-setup');
    } catch (err: any) {
        setApiError(err.message || 'Failed to verify OTP.');
    } finally {
        setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const fieldsToValidate: Array<keyof FormData> = ['name', 'username', 'newPassword'];
    if (!validateForm(fieldsToValidate)) return;

    setLoading(true);
    try {
      await mockApi.completeRegistration(formData.mobileNumber, {
          name: formData.name,
          username: formData.username,
          password: formData.newPassword,
          profile_pic_url: formData.profile_pic_url
      });
      await login(formData.mobileNumber, formData.newPassword);
      navigate('/dashboard/home');
    } catch (err: any) {
      setApiError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };


  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  const AuthMethodTab: React.FC<{ method: 'email' | 'mobile', children: React.ReactNode }> = ({ method, children }) => (
    <button
        onClick={() => handleAuthMethodChange(method)}
        className={`w-full py-2.5 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none flex items-center justify-center gap-2 ${
            authMethod === method ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800'
        }`}
    >
        {children}
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="bg-[#1C1C1C] rounded-2xl shadow-lg p-8 relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <Logo className="h-8 w-auto" />
          </div>

          <div className="flex items-center p-1 bg-zinc-800/80 rounded-lg mb-8">
            <AuthMethodTab method="email"><Mail size={16}/> Email</AuthMethodTab>
            <AuthMethodTab method="mobile"><Smartphone size={16}/> Mobile</AuthMethodTab>
          </div>

          <AnimatePresence mode="wait">
            {authMethod === 'email' && (
                <motion.div key="email-auth">
                    {view === 'login' && (
                      <motion.div key="login" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                        <div className="text-left mb-8">
                          <h1 className="text-3xl font-bold text-white">Log In</h1>
                          <p className="text-zinc-400 mt-1">Welcome back, champ.</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleLogin} noValidate>
                          <Input name="loginEmail" id="email" label="Email" type="email" autoComplete="email" required value={formData.loginEmail} onChange={handleChange} onBlur={handleBlur} error={errors.loginEmail} placeholder="hi@paujie.com" icon={<Mail className="h-5 w-5 text-gray-500" />}/>
                          <Input name="loginPassword" id="password" label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={formData.loginPassword} onChange={handleChange} onBlur={handleBlur} error={errors.loginPassword} placeholder="••••••••••••" icon={<Lock className="h-5 w-5 text-gray-500" />} rightIcon={showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />} onRightIconClick={() => setShowPassword(!showPassword)}/>
                          <div className="text-right text-sm -mt-2"><a href="#" onClick={() => handleViewChange('forgot')} className="font-medium text-zinc-400 hover:text-white transition-colors">Forgot Password?</a></div>
                          <div className="pt-2"><Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" disabled={loading}>{loading ? 'Signing in...' : 'Log In'}</Button></div>
                        </form>
                      </motion.div>
                    )}
                    {view === 'forgot' && (
                      <motion.div key="forgot" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                        <div className="text-left mb-8"><h1 className="text-3xl font-bold text-white">Reset Password</h1><p className="text-zinc-400 mt-1">Enter your email to receive a code.</p></div>
                        <form className="space-y-4" onSubmit={handleSendEmailCode} noValidate>
                          <Input name="resetEmail" id="reset-email" label="Email" type="email" autoComplete="email" required value={formData.resetEmail} onChange={handleChange} onBlur={handleBlur} error={errors.resetEmail} placeholder="hi@paujie.com" icon={<Mail className="h-5 w-5 text-gray-500" />}/>
                          <div className="pt-2"><Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" disabled={loading}>{loading ? 'Sending...' : 'Send Code'}</Button></div>
                          <div className="text-center text-sm"><a href="#" onClick={() => handleViewChange('login')} className="font-medium text-zinc-400 hover:text-white transition-colors">Back to Login</a></div>
                        </form>
                      </motion.div>
                    )}
                    {view === 'reset' && (
                      <motion.div key="reset" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                        <div className="text-left mb-8"><h1 className="text-3xl font-bold text-white">Enter Code</h1><p className="text-zinc-400 mt-1">Check your email for the verification code.</p></div>
                        <form className="space-y-4" onSubmit={handleResetPassword} noValidate>
                          <OtpInput length={6} label="Verification Code" onChange={handleOtpChange} error={errors.otp}/>
                          <Input name="newPassword" id="new-password" label="New Password" type="password" required value={formData.newPassword} onChange={handleChange} onBlur={handleBlur} error={errors.newPassword} placeholder="••••••••••••" icon={<Lock className="h-5 w-5 text-gray-500" />}/>
                          <div className="pt-2"><Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button></div>
                        </form>
                      </motion.div>
                    )}
                </motion.div>
            )}

            {authMethod === 'mobile' && (
                 <motion.div key="mobile-auth">
                    {view === 'login' && (
                      <motion.div key="mobile-login" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                        <div className="text-left mb-8"><h1 className="text-3xl font-bold text-white">Log In</h1><p className="text-zinc-400 mt-1">Use your mobile number to log in.</p></div>
                        <form className="space-y-4" onSubmit={handleLogin} noValidate>
                          <Input name="loginMobile" id="mobile" label="Mobile Number" type="tel" autoComplete="tel" required value={formData.loginMobile} onChange={handleChange} onBlur={handleBlur} error={errors.loginMobile} placeholder="123-456-7890" icon={<Smartphone className="h-5 w-5 text-gray-500" />}/>
                          <Input name="loginPassword" id="password-mobile" label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={formData.loginPassword} onChange={handleChange} onBlur={handleBlur} error={errors.loginPassword} placeholder="••••••••••••" icon={<Lock className="h-5 w-5 text-gray-500" />} rightIcon={showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />} onRightIconClick={() => setShowPassword(!showPassword)}/>
                          <div className="text-right text-sm -mt-2"><a href="#" className="font-medium text-zinc-400 hover:text-white transition-colors">Forgot Password?</a></div>
                          <div className="pt-2"><Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" disabled={loading}>{loading ? 'Signing in...' : 'Log In'}</Button></div>
                          <div className="text-center text-sm"><span className="text-zinc-400">New user? </span><a href="#" onClick={() => handleViewChange('mobile-register')} className="font-medium text-white hover:underline transition-colors">Register with Mobile</a></div>
                        </form>
                      </motion.div>
                    )}
                    {view === 'mobile-register' && (
                      <motion.div key="mobile-register" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                        <div className="text-left mb-8"><h1 className="text-3xl font-bold text-white">Register</h1><p className="text-zinc-400 mt-1">Enter your mobile to get started.</p></div>
                        <form className="space-y-4" onSubmit={handleSendMobileOtp} noValidate>
                          <Input name="mobileNumber" id="register-mobile" label="Mobile Number" type="tel" autoComplete="tel" required value={formData.mobileNumber} onChange={handleChange} onBlur={handleBlur} error={errors.mobileNumber} placeholder="123-456-7890" icon={<Smartphone className="h-5 w-5 text-gray-500" />}/>
                          <div className="pt-2"><Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" disabled={loading}>{loading ? 'Sending OTP...' : 'Send OTP'}</Button></div>
                           <div className="text-center text-sm"><span className="text-zinc-400">Have an account? </span><a href="#" onClick={() => handleViewChange('login')} className="font-medium text-white hover:underline transition-colors">Log In</a></div>
                        </form>
                      </motion.div>
                    )}
                     {view === 'mobile-verify' && (
                      <motion.div key="mobile-verify" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                        <div className="text-left mb-8"><h1 className="text-3xl font-bold text-white">Verify</h1><p className="text-zinc-400 mt-1">Enter the code sent to your phone.</p></div>
                        <form className="space-y-6" onSubmit={handleVerifyOtp} noValidate>
                           <OtpInput length={6} label="Verification Code" onChange={handleOtpChange} error={errors.otp} />
                           <Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</Button>
                        </form>
                      </motion.div>
                    )}
                    {view === 'mobile-setup' && (
                        <motion.div key="mobile-setup" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                            <div className="text-left mb-6"><h1 className="text-3xl font-bold text-white">Profile Setup</h1><p className="text-zinc-400 mt-1">Last step! Set up your profile.</p></div>
                            <form className="space-y-4" onSubmit={handleCompleteRegistration} noValidate>
                                <AvatarPicker label="Choose Avatar" initialValue={formData.profile_pic_url} onChange={handleAvatarChange} />
                                <Input name="name" label="Full Name" value={formData.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} icon={<User className="h-5 w-5 text-gray-500" />} />
                                <Input name="username" label="Username" value={formData.username} onChange={handleChange} onBlur={handleBlur} error={errors.username} icon={<AtSign className="h-5 w-5 text-gray-500" />}/>
                                <Input name="newPassword" label="Set Password" type="password" required value={formData.newPassword} onChange={handleChange} onBlur={handleBlur} error={errors.newPassword} placeholder="••••••••••••" icon={<Lock className="h-5 w-5 text-gray-500" />}/>
                                <div className="pt-2"><Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" disabled={loading}>{loading ? 'Finishing...' : 'Complete Registration'}</Button></div>
                            </form>
                        </motion.div>
                    )}
                 </motion.div>
            )}
          </AnimatePresence>
          
          {apiError && <p className="text-sm text-red-400 text-center pt-4">{apiError}</p>}
          {success && <p className="text-sm text-green-400 text-center pt-4">{success}</p>}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
