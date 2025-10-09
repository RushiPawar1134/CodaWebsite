import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="p-8 text-center">Loading projects...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    
 <div>
      <h1 className="text-2xl font-bold mb-6">Your Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="p-4 flex flex-col items-center">
            <CardHeader className="w-full p-0 mb-4">
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
    </div>

  );
}

function CreateProject({ onCreated }: { onCreated: () => void }) {
  const { register, handleSubmit, reset } = useForm<Project>();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCreateProject = async (data: Project) => {
    setCreating(true);
    try {
      await api.post("/api/admin/projects", data);
      reset();
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      <form
        className="mb-8 p-4 border rounded max-w-md"
        onSubmit={handleSubmit(onCreateProject)}
      >
        <input
          {...register("name", { required: true })}
          placeholder="Project Name"
          className="mb-2 p-2 border rounded w-full"
        />
        <textarea
          {...register("description", { required: true })}
          placeholder="Description"
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          {...register("thumbnail")}
          placeholder="Thumbnail URL"
          className="mb-2 p-2 border rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Project"}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    </div>
  );
}
// ...existing imports...

export default function Projects() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex gap-4 mb-8">
        <button
          className="py-2 px-4 rounded font-semibold"
          onClick={() => navigate("/admin/projects")}
        >
          Your Projects
        </button>
        <button
          className="py-2 px-4 rounded font-semibold"
          onClick={() => navigate("/admin/projects/new")}
        >
          New Project
        </button>
      </div>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/new" element={<CreateProject onCreated={() => {}} />} />
      </Routes>
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import api from "@/services/api";
// import { Card } from "@/components/ui/card";
// import { useForm } from "react-hook-form";

// interface Project {
//   id: string;
//   name: string;
//   description: string;
//   thumbnail: string; // URL or path to image
// }

// // Create a new project
// interface CreateProjectForm {
//   name: string;
//   description: string;
//   thumbnail: string;
// }

// export default function Projects() {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   // Form state for creating a new project
//   const { register, handleSubmit, reset } = useForm<CreateProjectForm>();
//   const [creating, setCreating] = useState(false);
//   const onCreateProject = async (data: CreateProjectForm) => {
//     setCreating(true);
//     try {
//       const res = await api.post("/api/admin/projects", data);
//       setProjects((prev) => [res.data, ...prev]); // Add new project to list
//       reset();
//     } catch (err: any) {
//       setError(err?.response?.data?.message || "Failed to create project");
//     } finally {
//       setCreating(false);
//     }
//   };

//   useEffect(() => {
//     api
//       .get("/api/admin/projects")
//       .then((res) => {
//         setProjects(res.data.items || []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err?.response?.data?.message || "Failed to load projects");
//         setLoading(false);
//       });
//   }, []);

//   if (loading)
//     return <div className="p-8 text-center">Loading projects...</div>;
//   if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">All Projects</h1>
//             {/* Create Project Form */}
//       <form
//         className="mb-8 p-4 border rounded max-w-md"
//         onSubmit={handleSubmit(onCreateProject)}
//       >
//         <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
//         <input
//           {...register("name", { required: true })}
//           placeholder="Project Name"
//           className="mb-2 p-2 border rounded w-full"
//         />
//         <textarea
//           {...register("description", { required: true })}
//           placeholder="Description"
//           className="mb-2 p-2 border rounded w-full"
//         />
//         <input
//           {...register("thumbnail")}
//           placeholder="Thumbnail URL"
//           className="mb-2 p-2 border rounded w-full"
//         />
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//           disabled={creating}
//         >
//           {creating ? "Creating..." : "Create Project"}
//         </button>
//       </form>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {projects.map((project) => (
//           <Card key={project.id} className="p-4 flex flex-col items-center">
//             <img
//               src={project.thumbnail}
//               alt={project.name}
//               className="w-full h-40 object-cover rounded mb-4"
//               style={{ maxWidth: "100%" }}
//             />
//             <h2 className="text-lg font-semibold mb-2">{project.name}</h2>
//             <p className="text-gray-600 text-sm mb-2 text-center">
//               {project.description}
//             </p>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
//
