import React from 'react';
import { NavLink } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function withUserLayout<P>(Component: React.ComponentType<P>) {
  const Wrapped: React.FC<P> = (props) => (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white p-4">
        <h2 className="font-bold text-lg">User Panel</h2>
        <Separator className="my-3" />
        <nav className="space-y-2">
          <NavLink
            to="/user/projects"
            className={({ isActive }) =>
              `block rounded px-3 py-2 ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
            }
          >
            My Projects
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Component {...(props as P)} />
      </main>
    </div>
  );
  return Wrapped;
}
