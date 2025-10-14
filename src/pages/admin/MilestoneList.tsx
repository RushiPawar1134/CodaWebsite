import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/services/api";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

const SUMMARY_COLUMNS = ["Type/Disciplin", "Units", "Summary"];

const groupRowsByType = (rows: any[]) => {
  const groups: Record<string, { normals: any[]; total: any | null }> = {};
  for (const row of rows) {
    const type = row[2] || "Unknown";
    if (row[0] === "" && row[9]) {
      if (!groups[type]) groups[type] = { normals: [], total: null };
      groups[type].total = row;
    } else {
      if (!groups[type]) groups[type] = { normals: [], total: null };
      groups[type].normals.push(row);
    }
  }
  return groups;
};

const MilestoneList: React.FC = () => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSummaryId, setOpenSummaryId] = useState<string | null>(null);
  const [openPptId, setOpenPptId] = useState<string | null>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
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
    if (openSummaryId && summaryRef.current) {
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [openSummaryId]);

  useEffect(() => {
    if (highlightId && cardRefs.current[highlightId]) {
      cardRefs.current[highlightId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [milestones, highlightId]);

  const handleSummaryClick = (id: string) => {
    setOpenSummaryId(id);
    setOpenPptId(null);
    setActiveViewId("summary");
  };

  const getSummaryRows = (milestone: any) => {
    if (!milestone?.csvSummary?.summaryData) return [];
    let rows: any[] = [];
    Object.values(milestone.csvSummary.summaryData).forEach(
      (discipline: any) => {
        rows = rows.concat(discipline.records);
      }
    );
    return rows;
  };

  const openMilestone = milestones.find((m) => m.id === openSummaryId);
  const summaryRows = openMilestone ? getSummaryRows(openMilestone) : [];
  const groups = groupRowsByType(summaryRows);

  if (loading)
    return <div className="p-8 text-center">Loading milestones...</div>;

  // delete handler
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this milestone?"))
      return;
    try {
      await api.delete(`/api/milestones/${id}`);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
      if (openSummaryId === id) setOpenSummaryId(null);
      if (openPptId === id) setOpenPptId(null);
    } catch (err) {
      alert("Failed to delete milestone.");
    }
  };

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
            <div className="flex gap-2 mt-2 mb-2">
              <Button
                onClick={() => handleSummaryClick(m.id)}
                variant={openSummaryId === m.id ? "secondary" : "default"}
              >
                Summary
              </Button>
              <Button
                onClick={() => {
                  setOpenPptId(m.id);
                  setOpenSummaryId(null);
                  setActiveViewId("ppt");
                }}
                variant={openPptId === m.id ? "secondary" : "default"}
              >
                {openPptId === m.id ? "Hide PPT Data" : "Show Full PPT"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {activeViewId === "summary" && openMilestone && (
        <div
          ref={summaryRef}
          className="mt-12 bg-white rounded shadow p-6 max-w-screen-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <strong className="text-lg">
              Summary for: {openMilestone.name}
            </strong>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenSummaryId(null)}
            >
              Close
            </Button>
          </div>
          {summaryRows.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    {SUMMARY_COLUMNS.map((col) => (
                      <TableHead key={col} className="whitespace-normal">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groups).map(
                    ([type, { normals, total }]) => (
                      <TableRow key={type} className={total ? "bg-gray-100 font-bold" : ""}>
                        {/* Type/Disciplin */}
                        <TableCell>
                          {total && total[2] !== undefined && total[2] !== null
                            ? String(total[2])
                            : type}
                        </TableCell>
                        {/* Units */}
                        <TableCell>
                          {total && total[6] !== undefined && total[6] !== null
                            ? String(total[6])
                            : ""}
                        </TableCell>
                        {/* Summary */}
                        <TableCell>
                          {total && total[9] !== undefined && total[9] !== null
                            ? String(total[9])
                            : ""}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div>No summary data available.</div>
          )}
        </div>
      )}

      {activeViewId === "ppt" &&
        openPptId &&
        (() => {
          const pptMilestone = milestones.find((m) => m.id === openPptId);
          if (!pptMilestone || !pptMilestone.pptData) return null;

          return (
            <div className="mt-12 bg-white rounded shadow p-6 max-w-screen-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-lg">
                  PPT Data for: {pptMilestone.name}
                </strong>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setOpenPptId(null);
                    setActiveViewId(null);
                  }}
                >
                  Close
                </Button>
              </div>
              <ul className="list-disc ml-4">
                {pptMilestone.pptData.map((slide: any, index: number) => (
                  <li key={index} className="mb-2">
                    <strong>{slide.title}</strong>
                    <ul className="ml-4 list-disc">
                      {slide.bullets.map((bullet: string, idx: number) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
    </div>
  );
};

export default MilestoneList;