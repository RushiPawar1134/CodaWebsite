import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"; // ✅ added import
import api from "@/services/api";

export function withAdminLayout<P>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<{ name: string; role: string } | null>(
      null
    );

    useEffect(() => {
      api
        .get("/api/users/me")
        .then((res) => setAdmin(res.data))
        .catch(() => setAdmin(null));
    }, []);

    const handleSignOut = () => {
      localStorage.removeItem("token");
      navigate("/login");
    };

    return (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white p-4 flex flex-col h-screen">
          {/* Admin info */}
          <div className="flex flex-row items-center mb-6 gap-3">
            <Avatar className="w-14 h-14">
              <AvatarFallback>
                {admin?.name ? admin.name[0].toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">
                {admin?.name.toUpperCase() || "Admin"}
              </div>
              <div className="text-xs text-purple-600 font-medium mt-1">
                {admin?.role === "ADMIN" ? "SUPER ADMIN" : admin?.role || ""}
              </div>
            </div>
          </div>

          <h2 className="font-bold text-lg">Admin Panel</h2>
          <Separator className="my-3" />

          {/* Navigation */}
          <nav className="space-y-4 flex-1 overflow-y-auto">
            {/* Project Section */}
            <div>
              <div className="text-xs font-semibold mb-2">Project</div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/admin/projects")}
              >
                Your Projects
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/admin/projects/new")}
              >
                New Project
              </Button>
            </div>

            {/* User Section */}
            <div>
              <div className="text-xs font-semibold mb-2">User</div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/admin/users")}
              >
                User List
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/admin/users/new")}
              >
                New User
              </Button>
            </div>
            {/* Milestone Section */}
            <div>
              <div className="text-xs font-semibold mb-2">Milestone</div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/admin/milestones")}
              >
                Milestone List
              </Button>
              {/* <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/admin/milestones/new")}
              >
                Create Milestone
              </Button> */}
            </div>
          </nav>

          {/* Sign Out */}
          <div className="mt-4">
            <Button
              variant="default"
              className="bg-purple-600 text-white font-semibold w-full"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Component {...(props as P)} />
        </main>
      </div>
    );
  };
  return Wrapped;
}
