import { useEffect, useState } from "react";
import api from "@/services/api";
import { useForm } from "react-hook-form";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel, // ✅ NEW
  flexRender,
} from "@tanstack/react-table";
import type { SortingState, ColumnDef } from "@tanstack/react-table"; // ✅ correct import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ✅ for search box

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  avatarUrl?: string;
  userProjects?: any[];
}

interface CreateUserForm {
  email: string;
  name: string;
  password: string;
  role: "USER" | "ADMIN";
  userProjects: any[];
}

export function CreateUser({ onCreated }: { onCreated: () => void }) {
  const { register, handleSubmit, reset } = useForm<CreateUserForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: CreateUserForm) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/admin/users", data);
      reset();
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create New User</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("email", { required: true })}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          {...register("name", { required: true })}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        <input
          {...register("password", { required: true })}
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        <select {...register("role")} className="w-full p-2 border rounded">
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Creating..." : "Create User"}
        </Button>

        {error && <div className="text-red-500">{error}</div>}
      </form>
    </div>
  );
}

export default function Users() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(""); // ✅ NEW

  useEffect(() => {
    api
      .get("/api/admin/users")
      .then((res) => {
        const items = Array.isArray(res.data.items) ? res.data.items : res.data;
        setData(items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load users");
        api
          .get("/api/admin/users")
          .then((res) => {
            const items = Array.isArray(res.data.items)
              ? res.data.items
              : res.data;
            setData(items);
            setLoading(false);
          })
          .catch((err) => {
            setError(err?.response?.data?.message || "Failed to load users");
            setLoading(false);
          });
      });
  }, []);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>
                {(user.name || user.email)?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        );
      },
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    {
      accessorKey: "userProjects",
      header: "Projects",
      cell: ({ row }) => {
        const user = row.original;
        return user.userProjects && user.userProjects.length > 0 ? (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold">
            Assigned
          </span>
        ) : (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-semibold">
            Not Assigned
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return date.toLocaleDateString();
      },
    },
  ];

  // ✅ Table instance with pagination enabled
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // ✅ pagination
  });

  const handleUserCreated = () => {
    setActiveTab("list");
    setLoading(true);
    api.get("/api/admin/users").then((res) => {
      const items = Array.isArray(res.data.items) ? res.data.items : res.data;
      setData(items);
      setLoading(false);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <Button
          variant={activeTab === "list" ? "secondary" : "outline"}
          onClick={() => setActiveTab("list")}
        >
          User List
        </Button>
        <Button
          variant={activeTab === "create" ? "secondary" : "outline"}
          onClick={() => setActiveTab("create")}
        >
          New User
        </Button>
      </div>

      {activeTab === "list" ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">User List</h1>

          {/* ✅ Search bar */}
          <div className="mb-4 flex justify-between items-center">
            <Input
              placeholder="Search users..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <Table className="min-w-full bg-white rounded shadow">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="cursor-pointer select-none"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* ✅ Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <CreateUser onCreated={handleUserCreated} />
      )}
    </div>
  );
}

// import { useEffect, useState } from "react";
// import api from "@/services/api";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import type { User } from "@/types/auth";
// import { UserProject } from "../../../../Backend/src/generated/prisma/index";

// export default function Users() {
//   const [data, setData] = useState<User[]>([]);
//   const [filtered, setFiltered] = useState<User[]>([]);
//   const [q, setQ] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let ignore = false;
//     (async () => {
//       try {
//         const res = await api.get("/api/admin/users");
//         if (!ignore) {
//           // Defensive: handle missing or invalid items
//           const items = Array.isArray(res.data.items) ? res.data.items : [];
//           setData(items);
//           setFiltered(items);
//         }
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       } catch (err) {
//         alert("Failed to load users");
//       } finally {
//         setLoading(false);
//       }
//     })();
//     return () => {
//       ignore = true;
//     };
//   }, []);

//   useEffect(() => {
//     const lower = q.toLowerCase();
//     setFiltered(
//       data.filter(
//         (u) =>
//           u.email.toLowerCase().includes(lower) ||
//           (u.name || "").toLowerCase().includes(lower) ||
//           u.role.toLowerCase().includes(lower)
//       )
//     );
//   }, [q, data]);

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Users</h1>
//         <Input
//           placeholder="Search users..."
//           className="w-64"
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//         />
//       </div>

//       {loading ? (
//         <div className="space-y-2">
//           {[...Array(5)].map((_, i) => (
//             <div className="flex items-center gap-3" key={i}>
//               <Skeleton className="h-6 w-6 rounded-full" />
//               <Skeleton className="h-5 w-40" />
//               <Skeleton className="h-5 w-28" />
//               <Skeleton className="h-5 w-24" />
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="rounded-md border bg-white">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>User</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Role</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filtered.map((u) => (
//                 <TableRow key={u.id}>
//                   <TableCell className="flex items-center gap-2">
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage src={u.avatarUrl} />
//                       <AvatarFallback>
//                         {(u.name || u.email).slice(0, 2).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="font-medium">{u.name || "—"}</span>
//                   </TableCell>
//                   <TableCell>{u.email}</TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={u.role === "ADMIN" ? "default" : "secondary"}
//                     >
//                       {u.role}
//                     </Badge>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {filtered.length === 0 && (
//                 <TableRow>
//                   <TableCell
//                     colSpan={3}
//                     className="text-center text-sm text-gray-500"
//                   >
//                     No users found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import api from "@/services/api";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import type { User } from "@/types/auth";
// import { UserProject } from "../../../../Backend/src/generated/prisma/index";

// export default function Users() {
//   const [data, setData] = useState<User[]>([]);
//   const [filtered, setFiltered] = useState<User[]>([]);
//   const [q, setQ] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let ignore = false;
//     (async () => {
//       try {
//         const res = await api.get("/api/admin/users");
//         if (!ignore) {
//           // Defensive: handle missing or invalid items
//           const items = Array.isArray(res.data.items) ? res.data.items : [];
//           setData(items);
//           setFiltered(items);
//         }
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       } catch (err) {
//         alert("Failed to load users");
//       } finally {
//         setLoading(false);
//       }
//     })();
//     return () => {
//       ignore = true;
//     };
//   }, []);

//   useEffect(() => {
//     const lower = q.toLowerCase();
//     setFiltered(
//       data.filter(
//         (u) =>
//           u.email.toLowerCase().includes(lower) ||
//           (u.name || "").toLowerCase().includes(lower) ||
//           u.role.toLowerCase().includes(lower)
//       )
//     );
//   }, [q, data]);

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Users</h1>
//         <Input
//           placeholder="Search users..."
//           className="w-64"
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//         />
//       </div>

//       {loading ? (
//         <div className="space-y-2">
//           {[...Array(5)].map((_, i) => (
//             <div className="flex items-center gap-3" key={i}>
//               <Skeleton className="h-6 w-6 rounded-full" />
//               <Skeleton className="h-5 w-40" />
//               <Skeleton className="h-5 w-28" />
//               <Skeleton className="h-5 w-24" />
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="rounded-md border bg-white">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>User</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Role</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filtered.map((u) => (
//                 <TableRow key={u.id}>
//                   <TableCell className="flex items-center gap-2">
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage src={u.avatarUrl} />
//                       <AvatarFallback>
//                         {(u.name || u.email).slice(0, 2).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="font-medium">{u.name || "—"}</span>
//                   </TableCell>
//                   <TableCell>{u.email}</TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={u.role === "ADMIN" ? "default" : "secondary"}
//                     >
//                       {u.role}
//                     </Badge>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {filtered.length === 0 && (
//                 <TableRow>
//                   <TableCell
//                     colSpan={3}
//                     className="text-center text-sm text-gray-500"
//                   >
//                     No users found
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//     </div>
//   );
// }
