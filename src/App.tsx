import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/auth/Login";
import ResetPassword from "@/pages/auth/ResetPassword";
import SetPassword from "./pages/auth/SetPassword";

import AdminDashboard from "@/pages/admin/Dashboard";
import Users from "@/pages/admin/Users";

import UserDashboard from "@/pages/user/Dashboard";
import Projects from "@/pages/user/Projects";
import AdminProjects from "@/pages/admin/Projects";
import Register from "@/pages/auth/Register";
import CreateUserPage from "./pages/admin/CreateUserPage";

import ProtectedRoute from "@/routes/ProtectRoute";
import { withAdminLayout } from "@/layouts/withAdminLayout";
import { withUserLayout } from "@/layouts/withUserLayout";

const AdminDashboardWL = withAdminLayout(AdminDashboard);
const UsersWL = withAdminLayout(Users);
const CreateUserPageWL = withAdminLayout(CreateUserPage);

const UserDashboardWL = withUserLayout(UserDashboard);
const ProjectsWL = withUserLayout(Projects);
const AdminProjectsWL = withAdminLayout(AdminProjects);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/set-password" element={<SetPassword />} /> {/* <-- Add this route */}

        {/* Admin Protected */}
        <Route element={<ProtectedRoute allow={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboardWL />} />
          <Route path="/admin/users" element={<UsersWL />} />
          <Route path="/admin/users/new" element={<CreateUserPageWL />} />
          <Route path="/admin/projects/*" element={<AdminProjectsWL />} />
        </Route>

        {/* User Protected */}
        <Route element={<ProtectedRoute allow={["USER", "ADMIN"]} />}>
          <Route path="/user" element={<UserDashboardWL />} />
          <Route path="/user/projects" element={<ProjectsWL />} />
        </Route>
        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Login from '@/pages/auth/Login';
// import ResetPassword from '@/pages/auth/ResetPassword';

// import AdminDashboard from '@/pages/admin/Dashboard';
// import Users from '@/pages/admin/Users';

// import UserDashboard from '@/pages/user/Dashboard';
// import Projects from '@/pages/user/Projects';

// import ProtectedRoute from '@/routes/ProtectRoute';
// import { withAdminLayout } from '@/layouts/withAdminLayout';
// import { withUserLayout } from '@/layouts/withUserLayout';
// import { CreateUser } from './pages/admin/Users';

// const AdminDashboardWL = withAdminLayout(AdminDashboard);
// const UsersWL = withAdminLayout(Users);

// const UserDashboardWL = withUserLayout(UserDashboard);
// const ProjectsWL = withUserLayout(Projects);

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public */}
//         <Route path="/" element={<Login />} />
//         <Route path="/reset" element={<ResetPassword />} />

//         {/* Admin */}
//         <Route element={<ProtectedRoute allow={['ADMIN']} />}>
//           <Route path="/admin" element={<AdminDashboardWL />} />
//           <Route path="/admin/users" element={<UsersWL />} />
//           {/* Example additional route */}
//           {/* <Route path="/admin/projects" element={<ProjectsAdminWL />} /> */}
//         </Route>

//         {/* User */}
//         <Route element={<ProtectedRoute allow={['USER', 'ADMIN']} />}>
//           <Route path="/user" element={<UserDashboardWL />} />
//           <Route path="/user/projects" element={<ProjectsWL />} />
//         </Route>

//         {/* Fallback */}
//         <Route path="*" element={<Login />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }