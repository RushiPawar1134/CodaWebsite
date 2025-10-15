import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const MilestoneList: React.FC = () => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const highlightId = params.get("highlight");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    api.get("/api/milestones").then((res) => {
      const milestones = res.data.map((m: any) => {
        let parsedSummary = m.csvSummary;
        if (
          typeof parsedSummary === "string" &&
          parsedSummary.trim().startsWith("{")
        ) {
          try {
            parsedSummary = JSON.parse(parsedSummary);
          } catch {}
        }
        return { ...m, csvSummary: parsedSummary };
      });
      setMilestones(milestones);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (highlightId && cardRefs.current[highlightId]) {
      cardRefs.current[highlightId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [milestones, highlightId]);

  // delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this milestone?"))
      return;
    try {
      await api.delete(`/api/milestones/${id}`);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete milestone.");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading milestones...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Milestone List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.map((m) => (
          <Card
            key={m.id}
            ref={(el) => (cardRefs.current[m.id] = el)}
            className={`p-4 flex flex-col items-center relative ${
              highlightId === m.id ? "border-4 border-blue-500 shadow-lg" : ""
            }`}
          >
            {/* Delete Icon */}
            <Button
              onClick={() => handleDelete(m.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              title="Delete milestone"
            >
              <X size={20} />
            </Button>
            <div className="font-semibold text-lg mb-1">{m.name}</div>
            <div className="text-sm mb-1">
              <strong>File Name:</strong> {m.filesMeta?.[0]?.filename || "N/A"}
            </div>
            <div className="text-sm mb-1">
              <strong>Project Name:</strong> {m.project?.name || "No Project"}
            </div>
            <div className="text-sm mb-1">
              <strong>File Data:</strong>{" "}
              {m.filesMeta?.[0]?.url ? (
                <a
                  href={m.filesMeta[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              ) : (
                "N/A"
              )}
            </div>
            <Button
              onClick={() => navigate(`/admin/milestones/${m.id}`)}
              className="mt-4 w-full"
            >
              View Milestone
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MilestoneList;