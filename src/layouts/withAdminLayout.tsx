import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function withAdminLayout<P>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => {
    const navigate = useNavigate();

    // Example logout handler (clear token, etc.)
    const handleSignOut = () => {
      localStorage.removeItem("token"); // or your auth key
      navigate("/login");
    };

    return (
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-white p-4 flex flex-col">
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


// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { Separator } from '@/components/ui/separator';

// export function withAdminLayout<P>(Component: React.ComponentType<P>) {
//   const Wrapped: React.FC<P> = (props) => (
//     <div className="flex min-h-screen">
//       <aside className="w-64 border-r bg-white p-4">
//         <h2 className="font-bold text-lg">Admin Panel</h2>
//         <Separator className="my-3" />
//         <nav className="space-y-2">
//           <NavLink
//             to="/admin/users"
//             className={({ isActive }) =>
//               `block rounded px-3 py-2 ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
//             }
//           >
//             Users
//           </NavLink>
//           <NavLink
//             to="/admin/projects"
//             className={({ isActive }) =>
//               `block rounded px-3 py-2 ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
//             }
//           >
//             Projects
//           </NavLink>
//         </nav>
//       </aside>
//       <main className="flex-1 p-6 bg-gray-50">
//         <Component {...(props as P)} />
//       </main>
//     </div>
//   );
//   return Wrapped;
// }