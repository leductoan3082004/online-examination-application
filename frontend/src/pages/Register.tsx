import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { register as registerApi } from '../services/authService';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole] = useState<'teacher'>('teacher');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.id];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await registerApi({
        full_name: formData.name, // adjusted to common backend naming, adjust if needed
        email: formData.email,
        password: formData.password,
        role: userRole.toUpperCase()
      });
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err: any) {
      setErrors({ server: err.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Teacher Registration</h1>
        <p className="text-slate-500">Create an account to manage your exams and students</p>
      </div>

      {errors.server && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errors.server}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role selection removed, defaults to Teacher */}

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-semibold text-slate-700">
            Full name
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${errors.name ? 'text-red-400' : 'text-slate-400'}`}>
              <User className="h-5 w-5" />
            </div>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-3 bg-white border ${errors.name ? 'border-red-300 ring-red-100' : 'border-gray-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email address
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${errors.email ? 'text-red-400' : 'text-slate-400'}`}>
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-3 bg-white border ${errors.email ? 'border-red-300 ring-red-100' : 'border-gray-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Password (min 8 characters)
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${errors.password ? 'text-red-400' : 'text-slate-400'}`}>
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-3 bg-white border ${errors.password ? 'border-red-300 ring-red-100' : 'border-gray-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
            Confirm Password
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`}>
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-3 bg-white border ${errors.confirmPassword ? 'border-red-300 ring-red-100' : 'border-gray-200'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary-hover underline underline-offset-4">
            Log in
          </Link>
        </p>

        <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
          By joining, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </form>
    </div>
  );
};

export default Register;
