import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/services/api';

export function withAdminLayout<P>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<{ name: string; role: string } | null>(null);

    useEffect(() => {
      api.get("/api/users/me")
        .then(res => setAdmin(res.data))
        .catch(() => setAdmin(null));
    }, []);

    const handleSignOut = () => {
      localStorage.removeItem("token");
      navigate("/login");
    };

    return (
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-white p-4 flex flex-col">
          <div className="flex flex-row items-center mb-6 gap-3">
            <Avatar className="w-14 h-14 ">
              <AvatarFallback>
                {admin?.name ? admin.name[0].toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div>
            <div className="font-semibold">{admin?.name || "Admin"}</div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              {admin?.role === "ADMIN" ? "SUPER ADMIN" : admin?.role || ""}
              </div>
            </div>
          </div>
          <h2 className="font-bold text-lg">Admin Panel</h2>
          <Separator className="my-3" />
          <nav className="space-y-4 flex-1">
            <div>
              <div className="text-xs font-semibold mb-2">Project</div>
              <button
                className="block w-full text-left rounded px-3 py-2 hover:bg-gray-50"
                onClick={() => navigate("/admin/projects")}
              >
                Your Projects
              </button>
              <button
                className="block w-full text-left rounded px-3 py-2 hover:bg-gray-50"
                onClick={() => navigate("/admin/projects/new")}
              >
                New Project
              </button>
            </div>
            <div>
              <div className="text-xs font-semibold mb-2">User</div>
              <button
                className="block w-full text-left rounded px-3 py-2 hover:bg-gray-50"
                onClick={() => navigate("/admin/users")}
              >
                User List
              </button>
              <button
                className="block w-full text-left rounded px-3 py-2 hover:bg-gray-50"
                onClick={() => navigate("/admin/users/new")}
              >
                New User
              </button>
            </div>
          </nav>
          <button
            className="mt-8 bg-purple-600 text-white font-semibold rounded px-4 py-2 w-full"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </aside>
        <main className="flex-1 p-6 bg-gray-50">
          <Component {...(props as P)} />
        </main>
      </div>
    );
  };
  return Wrapped;
}