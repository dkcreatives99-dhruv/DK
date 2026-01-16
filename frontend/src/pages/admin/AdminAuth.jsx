import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || 'Invalid credentials');
        } else {
          toast.success('Welcome back!');
          navigate('/admin/dashboard');
        }
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error.message || 'Failed to create account');
        } else {
          toast.success('Account created successfully!');
          navigate('/admin/dashboard');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6" data-testid="admin-auth-page">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Back to Website */}
      <a 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        data-testid="back-to-website"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-manrope">Back to Website</span>
      </a>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-syne font-bold text-2xl">DK</span>
          </div>
          <h1 className="text-2xl font-syne font-bold text-white">
            Admin Portal
          </h1>
          <p className="text-slate-400 font-manrope text-sm mt-2">
            GST Invoice Management System
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-syne font-bold text-white mb-6 text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name (only for signup) */}
            {!isLogin && (
              <div>
                <label className="block text-slate-300 font-manrope text-sm mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    placeholder="Your name"
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    data-testid="auth-name-input"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-slate-300 font-manrope text-sm mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  data-testid="auth-email-input"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 font-manrope text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  data-testid="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl h-12 font-manrope font-semibold transition-all duration-300 glow-hover"
              data-testid="auth-submit-button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 font-manrope text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setName('');
                }}
                className="text-primary hover:text-primary-hover ml-2 font-semibold"
                data-testid="auth-toggle-button"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Info */}
        <p className="text-slate-500 text-xs text-center mt-6 font-manrope">
          Secure GST-compliant invoice management for your business
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;
