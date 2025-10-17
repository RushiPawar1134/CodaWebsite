import { useState } from "react";
import api from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
 const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/auth/request-reset", { email });
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/auth/verify-otp", { email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await api.post("/api/auth/reset-password-otp", { email, otp, password });
      setSuccess("Password reset successful! You can now login.");
      setStep(4);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Reset Password</h1>
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-blue-600 text-white">
            Send OTP
          </Button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-blue-600 text-white">
            Verify OTP
          </Button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-blue-600 text-white">
            Reset Password
          </Button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
      {step === 4 && (
        <div className="text-green-600 flex flex-col items-center">
          {success}
          <Button className="bg-black text-white mt-4" onClick={() => navigate("/login")}>Login</Button>
        </div>
      )}
    </div>
  );
}