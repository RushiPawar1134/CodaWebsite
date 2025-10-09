import { CreateUser } from "@/pages/admin/Users";
import { withAdminLayout } from "@/layouts/withAdminLayout";
import { useNavigate } from "react-router-dom";

function CreateUserPage() {
  const navigate = useNavigate();

  const handleUserCreated = () => {
    // After creating user, go back to user list
    navigate("/admin/users");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>
      <CreateUser onCreated={handleUserCreated} />
    </div>
  );
}

export default withAdminLayout(CreateUserPage);
