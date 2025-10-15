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

import { Toaster } from "react-hot-toast";



// New imports for milestone pages
import CreateMilestonePage from "./pages/admin/CreateMilestonePage";
import Milestones from "./pages/admin/Milestones";
import MilestoneView from "./pages/admin/MilestoneView";
const MilestonesWL = withAdminLayout(Milestones);

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
          <Route path="/admin/projects/:projectId/milestones/new" element={<CreateMilestonePage />} />
          <Route path="/admin/milestones/*" element={<MilestonesWL />} />
          <Route path="/admin/milestones/:milestoneId" element={<MilestoneView />} />
        </Route>

        {/* User Protected */}
        <Route element={<ProtectedRoute allow={["USER", "ADMIN"]} />}>
          <Route path="/user" element={<UserDashboardWL />} />
          <Route path="/user/projects" element={<ProjectsWL />} />
        </Route>
        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
