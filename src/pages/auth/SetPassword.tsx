import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import  api from "../../services/api";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Invalid or missing token.");
      return;
    }
    try {
      await api.post("/api/auth/set-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to set password");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Set Your Password</h1>
      {success ? (
        <div className="text-green-600">Password set! Redirecting to login...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-blue-600 text-white">
            Set Password
          </Button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
    </div>
  );
}