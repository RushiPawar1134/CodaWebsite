import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/hooks/useAuthStore';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      navigate('/auth/login');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-gray-500">Sign up to get started</p>

          <div>
            <Input placeholder="Name" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <Input placeholder="Email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <Input type="password" placeholder="Password" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Sign up'}
          </Button>
          <div className="text-center">
            <Link to="/auth/login" className="text-sm text-blue-600 hover:underline">Already have an account? Login</Link>
          </div>
        </form>
      </div>
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