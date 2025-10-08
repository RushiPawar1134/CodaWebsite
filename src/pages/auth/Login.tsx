import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/hooks/useAuthStore';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await login(data);
      // Role-based redirect
      if (user.role === 'ADMIN') navigate('/admin/users');
      else navigate('/user/projects');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold">Welcome back 👋</h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>

          <div>
            <Input placeholder="Email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <Input type="password" placeholder="Password" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center">
            <Link to="/reset" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
              <Link to="/auth/register" className="text-sm text-blue-600 hover:underline">Not registered? Sign up</Link>
          </div>
        </form>
      </div>

      {/* Right: Visual */}
      <div className="hidden bg-gray-50 md:block">
        <img
          src="https://images.unsplash.com/photo-1554232456-8727aae0cfa4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvbXBhbnl8ZW58MHx8MHx8fDA%3D"
          alt="Company visual"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
