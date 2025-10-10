import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["USER", "ADMIN"]),
  projects: z.array(z.string()).min(1, "Select at least one project"),
});

type FormData = z.infer<typeof schema>;

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api.get("/api/admin/projects").then((res) => {
      setProjects(res.data.items || res.data);
    });
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "USER",
      projects: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await api.post("/api/admin/users", data);
      reset();
      navigate("/admin/users");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create New User</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register("email")}
            placeholder="Email"
            className="w-full"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Input {...register("name")} placeholder="Name" className="w-full" />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-2">Assign Projects</label>
          <Controller
            name="projects"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {projects.map((project) => (
                  <label key={project.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={project.id}
                      checked={field.value.includes(project.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...field.value, project.id]);
                        } else {
                          field.onChange(
                            field.value.filter((id) => id !== project.id)
                          );
                        }
                      }}
                    />
                    {project.name}
                  </label>
                ))}
              </div>
            )}
          />
          {errors.projects && (
            <p className="text-xs text-red-500">{errors.projects.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
        {error && <div className="text-red-500">{error}</div>}
      </form>
    </div>
  );
}
