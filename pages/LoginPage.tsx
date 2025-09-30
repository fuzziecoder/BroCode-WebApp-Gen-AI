import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }
    
    try {
      await login(email, password);
      navigate('/dashboard/home');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="bg-[#1C1C1C] rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <Logo className="h-8 w-auto" />
          </div>
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-white">
              Log In
            </h1>
            <p className="text-zinc-400 mt-1">Welcome back, let's continue your journey.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input 
              id="email"
              label="Email" 
              type="email" 
              autoComplete="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hi@paujie.com"
              icon={<Mail className="h-5 w-5 text-gray-500" />}
            />
            <Input 
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={<Lock className="h-5 w-5 text-gray-500" />}
              rightIcon={showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              onRightIconClick={() => setShowPassword(!showPassword)}
            />

            {error && <p className="text-sm text-red-400 text-center pt-2">{error}</p>}

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full justify-center py-3 text-base" disabled={loading}>
                {loading ? 'Signing in...' : 'Log In'}
              </Button>
            </div>
          </form>
        </div>
        <p className="text-center text-sm text-zinc-400 mt-8">
          Don't have an account? <a href="#" className="font-medium text-white hover:underline">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;