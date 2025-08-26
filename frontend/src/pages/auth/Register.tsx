
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Loader2, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerAction } from '../../state/slices/authSlice';
import { RootState, AppDispatch } from '../../state/store';
import { RegisterRequest } from '../../services/types';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['FREELANCE', 'COMPANY'] as const, {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'FREELANCE' },
  });

  const [roleLocal, setRoleLocal] = useState<'FREELANCE' | 'COMPANY'>('FREELANCE');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await dispatch(registerAction(data as RegisterRequest)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      // handled by redux slice
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:block h-screen w-full relative">
        <video src="/hero.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="h-screen w-full bg-gradient-to-b from-[#030313] to-[#071022] relative">
  <Link to="/" className="absolute left-4 top-4 z-50 text-sm text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-md" aria-label="Go to homepage">← Home</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="h-full w-full backdrop-blur-md bg-white/6 border-l border-white/6 p-12 flex items-center">
          {/* content wrapper keeps readable width but not a card */}
          <div className="w-full max-w-2xl">
            <div className="mb-6">
              <motion.h2 className="text-4xl font-extrabold text-white" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                Join SkillBridge Pro
              </motion.h2>
              <p className="text-sm text-white/70 mt-2">Create your account and start matching with top opportunities</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-white/70" />
                <Input id="name" placeholder="Full name" {...register('name')} className={`pl-10 pr-3 py-3 ${errors.name ? 'border-destructive' : ''} bg-transparent text-white`} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3 text-white/70" />
                <Input id="email" type="email" placeholder="Email" {...register('email')} className={`pl-10 pr-3 py-3 ${errors.email ? 'border-destructive' : ''} bg-transparent text-white`} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setRoleLocal('FREELANCE'); setValue('role', 'FREELANCE'); }} className={`flex-1 py-2 rounded-lg ${roleLocal === 'FREELANCE' ? 'bg-primary text-white' : 'bg-white/6 text-white/80'}`}>Freelance</button>
                <button type="button" onClick={() => { setRoleLocal('COMPANY'); setValue('role', 'COMPANY'); }} className={`flex-1 py-2 rounded-lg ${roleLocal === 'COMPANY' ? 'bg-primary text-white' : 'bg-white/6 text-white/80'}`}>Company</button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-white/70" />
                <Input id="password" type="password" placeholder="Password" {...register('password')} className={`pl-10 pr-3 py-3 ${errors.password ? 'border-destructive' : ''} bg-transparent text-white`} />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-white/70" />
                <Input id="confirmPassword" type="password" placeholder="Confirm password" {...register('confirmPassword')} className={`pl-10 pr-3 py-3 ${errors.confirmPassword ? 'border-destructive' : ''} bg-transparent text-white`} />
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-primary to-secondary">
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" /> Creating account...</>) : 'Create Account'}
              </motion.button>
            </form>

            <div className="text-sm mt-6 text-white/70">
              Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Sign in</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;