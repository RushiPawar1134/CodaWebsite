import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function withUserLayout<P>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => {
    const navigate = useNavigate();

    const handleSignOut = () => {
      localStorage.removeItem("token"); // or your auth key
      navigate("/login");
    };

    return (
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-white p-4 flex flex-col">
          <h2 className="font-bold text-lg">User Panel</h2>
          <Separator className="my-3" />
          <nav className="space-y-4 flex-1">
            <button
              className="block w-full text-left rounded px-3 py-2 hover:bg-gray-50"
              onClick={() => navigate("/user/projects")}
            >
              My Projects
            </button>
            {/* Add more user navigation buttons here if needed */}
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