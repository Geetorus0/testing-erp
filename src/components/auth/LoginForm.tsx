'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/store';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Demo credentials for different roles
const DEMO_CREDENTIALS = [
  { role: 'Super Admin', email: 'superadmin@geetorus.edu', password: 'demo123' },
  { role: 'Principal', email: 'principal@geetorus.edu', password: 'demo123' },
  { role: 'HOD', email: 'hod.cs@geetorus.edu', password: 'demo123' },
  { role: 'Faculty', email: 'faculty.cs@geetorus.edu', password: 'demo123' },
  { role: 'Student', email: 'student@geetorus.edu', password: 'demo123' },
];

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function LoginForm({ onSuccess, redirectUrl = '/dashboard' }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        onSuccess?.();
        router.push(redirectUrl);
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };
  
  const handleDemoLogin = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your Geetorus CampusOS account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...register('email')}
                disabled={isLoading || isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                {...register('password')}
                disabled={isLoading || isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {(isLoading || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
        
        {/* Demo Credentials Section */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm font-medium text-center mb-3 text-muted-foreground">
            Demo Credentials
          </p>
          <div className="grid gap-2">
            {DEMO_CREDENTIALS.map((cred) => (
              <Button
                key={cred.role}
                type="button"
                variant="outline"
                size="sm"
                className="justify-between text-xs"
                onClick={() => handleDemoLogin(cred.email, cred.password)}
                disabled={isLoading || isSubmitting}
              >
                <span className="font-medium">{cred.role}</span>
                <span className="text-muted-foreground truncate max-w-[180px]">
                  {cred.email}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
