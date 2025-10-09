import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/api/user-projects/mine")
      .then((res) => {
        setProjects(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load projects");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading projects...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="p-4 flex flex-col items-center">
            <img
              src={project.thumbnail}
              alt={project.name}
              className="w-full h-40 object-cover rounded mb-4"
              style={{ maxWidth: "100%" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://via.placeholder.com/300x160?text=No+Image";
              }}
            />
            <h2 className="text-lg font-semibold mb-2">{project.name}</h2>
            <p className="text-gray-600 text-sm mb-2 text-center">
              {project.description}
            </p>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-gray-500">No projects assigned.</p>
        )}
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import api from "@/services/api";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import type { Project } from "@/types/resources";

// export default function Projects() {
//   const [data, setData] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let ignore = false;
//     (async () => {
//       try {
//         const res = await api.get<Project[]>("api/user/projects");
//         if (!ignore) setData(res.data);
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       } catch (e) {
//         alert("Failed to load projects");
//       } finally {
//         setLoading(false);
//       }
//     })();
//     return () => {
//       ignore = true;
//     };
//   }, []);

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {[...Array(6)].map((_, i) => (
//           <Card key={i} className="p-4">
//             <Skeleton className="h-6 w-1/2" />
//             <Skeleton className="mt-3 h-4 w-3/4" />
//             <Skeleton className="mt-4 h-8 w-24" />
//           </Card>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h1 className="mb-4 text-xl font-semibold">My Projects</h1>
//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {data.map((p) => (
//           <Card key={p.id} className="bg-white">
//             <CardHeader className="flex-row items-center justify-between">
//               <CardTitle className="text-lg">{p.name}</CardTitle>
//               <Badge
//                 variant={
//                   p.status === "active"
//                     ? "default"
//                     : p.status === "completed"
//                     ? "secondary"
//                     : "outline"
//                 }
//               >
//                 {p.status}
//               </Badge>
//             </CardHeader>
//             <CardContent>
//               <p className="text-sm text-gray-600">
//                 {p.description || "No description"}
//               </p>
//               <p className="mt-3 text-xs text-gray-400">
//                 Updated: {new Date(p.updatedAt).toLocaleString()}
//               </p>
//             </CardContent>
//           </Card>
//         ))}
//         {data.length === 0 && (
//           <p className="text-sm text-gray-500">No projects yet.</p>
//         )}
//       </div>
//     </div>
//   );
// }
