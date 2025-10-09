import React from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"; // ✅ import shadcn button

export function withUserLayout<P>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => {
    const navigate = useNavigate();

    const handleSignOut = () => {
      localStorage.removeItem("token");
      navigate("/login");
    };

    return (
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-white p-4 flex flex-col">
          <h2 className="font-bold text-lg">User Panel</h2>
          <Separator className="my-3" />

          {/* ✅ Use shadcn Button components here */}
          <nav className="space-y-4 flex-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/user/projects")}
            >
              My Projects
            </Button>
            {/* Add more user navigation buttons here if needed */}
          </nav>

          <Button
            variant="default"
            className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded w-full"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </aside>

        <main className="flex-1 p-6 bg-gray-50">
          <Component {...(props as P)} />
        </main>
      </div>
    );
  };

  return Wrapped;
}
