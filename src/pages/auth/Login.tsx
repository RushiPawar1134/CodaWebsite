import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/useAuthStore";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await login(data);
      if (user.role === "ADMIN") navigate("/admin");
      else navigate("/user/projects");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn("flex flex-col gap-6 w-full max-w-sm")}
        >
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Login to your account</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your email below to login to your account
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  to="/reset"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                required
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </Field>
            <FieldSeparator>Or continue with</FieldSeparator>
            <Field>
              <Button variant="outline" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    fill="currentColor"
                  />
                </svg>
                Login with GitHub
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link
                  to="/auth/register"
                  className="underline underline-offset-4"
                >
                  Sign up
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
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

// import { useNavigate, Link } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useAuthStore } from "@/hooks/useAuthStore";
// import { cn } from "@/lib/utils";
// import {
//   Field,
//   FieldDescription,
//   FieldGroup,
//   FieldLabel,
//   FieldSeparator,
// } from "@/components/ui/field";

// const schema = z.object({
//   email: z.string().email("Valid email required"),
//   password: z.string().min(6, "Minimum 6 characters"),
// });

// type FormData = z.infer<typeof schema>;

// export default function Login() {
//   const navigate = useNavigate();
//   const login = useAuthStore((s) => s.login);
//   const isLoading = useAuthStore((s) => s.isLoading);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(schema),
//   });

//   const onSubmit = async (data: FormData) => {
//     console.log("Submitting login", data);
//     try {
//       const user = await login(data);
//       // Role-based redirect
//       if (user.role === "ADMIN") navigate("/admin");
//       else navigate("/user/projects");
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (e: any) {
//       alert(e?.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
//       {/* Left: Form */}
//       <div className="flex items-center justify-center p-6">
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="w-full max-w-sm space-y-4"
//         >
//           <h1 className="text-2xl font-bold">Welcome back 👋</h1>
//           <p className="text-sm text-gray-500">Sign in to continue</p>

//           <div>
//             <Input placeholder="Email" {...register("email")} />
//             {errors.email && (
//               <p className="mt-1 text-xs text-red-500">
//                 {errors.email.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <Input
//               type="password"
//               placeholder="Password"
//               autoComplete="current-password"
//               {...register("password")}
//             />
//             {errors.password && (
//               <p className="mt-1 text-xs text-red-500">
//                 {errors.password.message}
//               </p>
//             )}
//           </div>

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Signing in..." : "Sign in"}
//           </Button>

//           <div className="text-center">
//             <Link to="/reset" className="text-sm text-blue-600 hover:underline">
//               Forgot password?
//             </Link>
//             <Link
//               to="/auth/register"
//               className="text-sm text-blue-600 hover:underline"
//             >
//               Not registered? Sign up
//             </Link>
//           </div>
//         </form>
//       </div>

//       {/* Right: Visual */}
//       <div className="hidden bg-gray-50 md:block">
//         <img
//           src="https://images.unsplash.com/photo-1554232456-8727aae0cfa4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvbXBhbnl8ZW58MHx8MHx8fDA%3D"
//           alt="Company visual"
//           className="h-full w-full object-cover"
//         />
//       </div>
//     </div>
//   );
// }
