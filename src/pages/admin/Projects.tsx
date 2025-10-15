/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LayoutGrid, List as ListIcon, Edit2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

const projectSchema = z.object({
  name: z.string().min(2, "Project name required"),
  description: z.string().min(2, "Description required"),
  thumbnail: z.string().optional(),
});
type ProjectFormData = z.infer<typeof projectSchema>;

function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  React.useEffect(() => {
    api
      .get("/api/admin/projects")
      .then((res) => {
        setProjects(res.data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load projects");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading projects...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <ListIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{projects.map((project) => (
  <Card
    key={project.id}
    className="p-4 flex flex-col items-center relative"
    style={{ minHeight: 320 }}
  >
    {/* Edit Icon */}
    <button
      className="absolute bottom-4 right-4 z-10 bg-white rounded-full shadow-lg p-2 border border-gray-300 hover:bg-blue-100 transition"
      title="Add Milestone"
      onClick={() =>
        navigate(`/admin/projects/${project.id}/milestones/new`)
      }
      style={{
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
    >
      <Edit2 size={22} className="text-blue-600" />
    </button>
    <CardHeader className="w-full p-0 mb-4" style={{ marginTop: "24px" }}>
      <img
        src={project.thumbnail}
        alt={project.name}
        className="w-full h-40 object-cover rounded"
        style={{ maxWidth: "100%" }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "https://via.placeholder.com/300x160?text=No+Image";
        }}
      />
    </CardHeader>
    <CardContent className="text-center">
      <CardTitle className="text-lg font-semibold mb-2">
        {project.name}
      </CardTitle>
      <p className="text-gray-600 text-sm mb-2">
        {project.description}
      </p>
    </CardContent>
  </Card>
))}
        </div>
      ) : (
        <Table>
<TableHeader>
  <TableRow>
    <TableHead>Thumbnail</TableHead>
    <TableHead>Name</TableHead>
    <TableHead>Description</TableHead>
    <TableHead>Edit</TableHead> {/* Add this */}
  </TableRow>
</TableHeader>
<TableBody>
  {projects.map((project) => (
    <TableRow key={project.id}>
      <TableCell>
        <img
          src={project.thumbnail}
          alt={project.name}
          className="w-24 h-16 object-cover rounded"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://via.placeholder.com/100x60?text=No+Image";
          }}
        />
      </TableCell>
      <TableCell className="font-semibold">{project.name}</TableCell>
      <TableCell>{project.description}</TableCell>
      <TableCell>
        <button
          className="bg-white rounded-full shadow p-2 border border-gray-200 hover:bg-blue-50"
          title="Add Milestone"
          onClick={() =>
            navigate(`/admin/projects/${project.id}/milestones/new`)
          }
          style={{
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Edit2 size={20} className="text-blue-600" />
        </button>
      </TableCell>
    </TableRow>
  ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function CreateProject({ onCreated }: { onCreated: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });
  const [error, setError] = useState<string | null>(null);

  const onCreateProject = async (data: ProjectFormData) => {
    setError(null);
    try {
      await api.post("/api/admin/projects", data);
      reset();
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create New Project</h1>
      <form onSubmit={handleSubmit(onCreateProject)} className="space-y-4">
        <div>
          <Input
            {...register("name")}
            placeholder="Project Name"
            className="w-full"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Input
            as="textarea"
            {...register("description")}
            placeholder="Description"
            className="w-full"
            rows={3}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>
        <div>
          <Input
            {...register("thumbnail")}
            placeholder="Thumbnail URL"
            className="w-full"
          />
          {errors.thumbnail && (
            <p className="text-xs text-red-500">{errors.thumbnail.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? "Creating..." : "Create Project"}
        </Button>
        {error && <div className="text-red-500">{error}</div>}
      </form>
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();

  const isCreate = location.pathname.endsWith("/new");

  return (
    <div>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/new" element={<CreateProject onCreated={() => {}} />} />
      </Routes>
    </div>
  );
}
