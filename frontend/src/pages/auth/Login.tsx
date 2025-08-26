import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '../../state/slices/authSlice';
import { RootState, AppDispatch } from '../../state/store';
import { LoginRequest } from '../../services/types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await dispatch(login(data as LoginRequest)).unwrap();
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the Redux slice
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left visual - full height */}
      <div className="hidden md:block h-screen w-full relative">
        <video src="/hero.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Right form pane - full height */}
      <div className="h-screen w-full relative flex items-center justify-center bg-gradient-to-b from-[#030313] to-[#071022]">
        <Link to="/" className="absolute left-4 top-4 text-sm text-white/80 hover:text-white" aria-label="Go to homepage">← Home</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-3xl mx-auto px-8 py-12">
          <div className="backdrop-blur-md bg-white/5 border border-white/8 rounded-2xl h-full p-10 flex flex-col justify-center shadow-xl">
            <div className="text-center mb-6">
              <motion.h2 className="text-4xl font-extrabold text-white" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                Welcome Back
              </motion.h2>
              <p className="text-sm text-white/70 mt-2">Sign in to continue to SkillBridge Pro</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-white/70" />
                <Input id="email" type="email" placeholder="Email" {...register('email')} className={`pl-10 pr-3 py-3 ${errors.email ? 'border-destructive' : ''} bg-transparent text-white`} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-white/70" />
                <Input id="password" type="password" placeholder="Password" {...register('password')} className={`pl-10 pr-3 py-3 ${errors.password ? 'border-destructive' : ''} bg-transparent text-white`} />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-sm text-white/80">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-primary" />
                  <span>Remember me</span>
                </label>
                <Link to="/auth/forgot" className="text-white/70 hover:underline">Forgot password?</Link>
              </div>

              <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-primary to-secondary shadow-[0_10px_30px_rgba(99,102,241,0.15)]">
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" /> Signing in...</>) : 'Sign In'}
              </motion.button>
            </form>

            <div className="text-center text-sm mt-6 text-white/70">
              Don't have an account? <Link to="/auth/register" className="text-primary hover:underline">Register</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;