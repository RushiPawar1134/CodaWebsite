/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const CreateMilestonePage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setError("Please upload a CSV file.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("fileName", fileName);
    formData.append("csv", csvFile);
    if (projectId) {
      formData.append("projectId", projectId);
    }

    try {
      const res = await api.post("/api/milestones/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Milestone created!");
      // Redirect to milestone list and highlight the new milestone
      navigate(`/admin/milestones?highlight=${res.data.milestone.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="max-w-md w-full p-6">
        <h1 className="text-xl font-bold mb-4">Create Milestone</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Milestone Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Parsing Data..." : "Create Milestone"}
          </Button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      </Card>
    </div>
  );
};

export default CreateMilestonePage;