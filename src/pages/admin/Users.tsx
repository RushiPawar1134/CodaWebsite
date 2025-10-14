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
import { ArrowUp, ArrowDown } from "lucide-react"; // ✅ NEW


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

// export function CreateUser({ onCreated }: { onCreated: () => void }) {
//   // const [error, setError] = useState<string | null>(null);

//   // const onSubmit = async (data: CreateUserForm) => {
//   //   setError(null);
//   //   try {
//   //     await api.post("/api/admin/users", data);
//   //     reset();
//   //     onCreated();
//   //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   //   } catch (err: any) {
//   //     setError(err?.response?.data?.message || "Failed to create user");
//   //   }
//   // };

//   // return (
//   //   <div className="max-w-md bg-white p-6 rounded shadow">
//   //     <h1 className="text-xl font-bold mb-4">Create New User</h1>
//   //     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//   //       <div>
//   //         <Input
//   //           {...register("email", { required: "Email is required" })}
//   //           placeholder="Email"
//   //           className="w-full"
//   //         />
//   //         {errors.email && (
//   //           <p className="text-xs text-red-500">{errors.email.message}</p>
//   //         )}
//   //       </div>
//   //       <div>
//   //         <Input
//   //           {...register("name", { required: "Name is required" })}
//   //           placeholder="Name"
//   //           className="w-full"
//   //         />
//   //         {errors.name && (
//   //           <p className="text-xs text-red-500">{errors.name.message}</p>
//   //         )}
//   //       </div>
//   //       <div>
//   //         <Input
//   //           {...register("password", { required: "Password is required" })}
//   //           type="password"
//   //           placeholder="Password"
//   //           className="w-full"
//   //         />
//   //         {errors.password && (
//   //           <p className="text-xs text-red-500">{errors.password.message}</p>
//   //         )}
//   //       </div>
//   //       <div>
//   //         <select {...register("role")} className="w-full p-2 border rounded">
//   //           <option value="USER">User</option>
//   //           <option value="ADMIN">Admin</option>
//   //         </select>
//   //         {errors.role && (
//   //           <p className="text-xs text-red-500">{errors.role.message}</p>
//   //         )}
//   //       </div>
//   //       <Button
//   //         type="submit"
//   //         disabled={isSubmitting}
//   //         className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//   //       >
//   //         {isSubmitting ? "Creating..." : "Create User"}
//   //       </Button>
//   //       {error && <div className="text-red-500">{error}</div>}
//   //     </form>
//   //   </div>
//   // );
// }

export default function Users() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [activeTab, setActiveTab] = useState<"list" | "create">("list");
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
      {/* <div className="flex gap-4 mb-4">
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
      </div> */}

      {/* {activeTab === "list" ? ( */}
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
                {/* <TableHeader>
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
                </TableHeader> */}
                <TableHeader>
  {table.getHeaderGroups().map((headerGroup) => (
    <TableRow key={headerGroup.id}>
      {headerGroup.headers.map((header) => {
        // Only show sort buttons for sortable columns
        const canSort = header.column.getCanSort();
        return (
          <TableHead key={header.id} className="select-none">
            <div className="flex items-center gap-1">
              {flexRender(
                header.column.columnDef.header,
                header.getContext()
              )}
              {canSort && (
                <span className="flex gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() =>
                      header.column.toggleSorting(false) // ASC
                    }
                    className={`p-0.5 rounded hover:bg-gray-100 ${
                      header.column.getIsSorted() === "asc"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      header.column.toggleSorting(true) // DESC
                    }
                    className={`p-0.5 rounded hover:bg-gray-100 ${
                      header.column.getIsSorted() === "desc"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    <ArrowDown size={14} />
                  </button>
                </span>
              )}
            </div>
          </TableHead>
        );
      })}
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
    </div>
  );
}
