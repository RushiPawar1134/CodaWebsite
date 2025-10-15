/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

const MilestoneView: React.FC = () => {
  const { milestoneId } = useParams();
  const [milestone, setMilestone] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showPpt, setShowPpt] = useState(false);
  const [showMasterSheet, setShowMasterSheet] = useState(false);
  const [masterSheetPage, setMasterSheetPage] = useState(1);
  const rowsPerPage = 5;
  const [editedComments, setEditedComments] = useState<{
    [rowIdx: number]: string;
  }>({});
  const [savingRow, setSavingRow] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/api/milestones/${milestoneId}`).then((res) => {
      let m = res.data;
      let parsedSummary = m.csvSummary;
      if (
        typeof parsedSummary === "string" &&
        parsedSummary.trim().startsWith("{")
      ) {
        try {
          parsedSummary = JSON.parse(parsedSummary);
        } catch (e) {
          console.error("Failed to parse csvSummary:", e);
          parsedSummary = {};
        }
      }
      setMilestone({ ...m, csvSummary: parsedSummary });
      setLoading(false);
    });
  }, [milestoneId]);

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

  const summaryRows = milestone ? getSummaryRows(milestone) : [];
  const groups = groupRowsByType(summaryRows);

  // Master Sheet
  const masterSheetRows = milestone?.masterSheetData || [];
  const masterSheetColumns =
    masterSheetRows.length > 0 ? Object.keys(masterSheetRows[0]) : [];
  const totalPages = Math.ceil(masterSheetRows.length / rowsPerPage);
  const paginatedRows = masterSheetRows.slice(
    (masterSheetPage - 1) * rowsPerPage,
    masterSheetPage * rowsPerPage
  );

  const handleCommentChange = (idx: number, value: string) => {
    setEditedComments((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSaveComment = async (rowIdx: number) => {
    setSavingRow(rowIdx);
    // Prepare updated masterSheetData
    const updatedRows = [...masterSheetRows];
    updatedRows[rowIdx]["COMMENTS/REMARKS"] = editedComments[rowIdx] || "";
    try {
      await api.patch(`/api/milestones/${milestoneId}/master-sheet`, {
        masterSheetData: updatedRows,
      });
      // Update milestone state
      setMilestone((prev: any) => ({
        ...prev,
        masterSheetData: updatedRows,
      }));
    } catch (e) {
      alert("Failed to save comment");
    }
    setSavingRow(null);
  };

  return (
    <div className="p-8 max-w-8xl mx-auto">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">{milestone.name}</h2>
          {/* Summary Section */}
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setShowSummary((v) => !v)}
              className="mb-2"
            >
              Summary {showSummary ? "▲" : "▼"}
            </Button>
            {showSummary && (
              <div className="mb-4">
                <Table className="mb-4">
                  <TableHeader>
                    <TableRow>
                      {SUMMARY_COLUMNS.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groups).map(
                      ([type, { normals, total }]) => (
                        <TableRow
                          key={type}
                          className={total ? "bg-gray-100 font-bold" : ""}
                        >
                          <TableCell>
                            {total &&
                            total[2] !== undefined &&
                            total[2] !== null
                              ? String(total[2])
                              : type}
                          </TableCell>
                          <TableCell>
                            {total &&
                            total[6] !== undefined &&
                            total[6] !== null
                              ? String(total[6])
                              : ""}
                          </TableCell>
                          <TableCell>
                            {total &&
                            total[9] !== undefined &&
                            total[9] !== null
                              ? String(total[9])
                              : ""}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          {/* Master Sheet Section */}
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setShowMasterSheet((v) => !v)}
              className="mb-2"
            >
              Master Sheet {showMasterSheet ? "▲" : "▼"}
            </Button>
            {showMasterSheet && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {masterSheetColumns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((row: any, idx: number) => (
                      <TableRow
                        key={idx + (masterSheetPage - 1) * rowsPerPage}
                        style={{ height: 120 }} // Increase row height
                      >
                        {masterSheetColumns.map((col) => {
  // For IMG 1 and IMG 2 columns, show thumbnail and set cell width
  if (
    (col.toLowerCase() === "img 1" || col.toLowerCase() === "img 2") &&
    row[col]
  ) {
    return (
      <TableCell
        key={col}
        style={{
          verticalAlign: "middle",
          minWidth: 240, // Set min width for the cell
          width: 240,
          maxWidth: 240,
        }}
      >
        {row[col] ? (
          <img
            src={row[col]}
            alt={`thumbnail-${col}-${idx}`}
            style={{
              width: 220, // Image width
              height: 140, // Image height
              objectFit: "cover",
              borderRadius: 4,
              display: "block",
              margin: "0 auto",
            }}
            onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/220x140?text=No+Image")
            }
          />
        ) : null}
      </TableCell>
    );
  }
                          // For comments/remarks columns, show editable input and save button
                          if (col.toLowerCase().includes("comment")) {
                            return (
                              <TableCell
                                key={col}
                                style={{ verticalAlign: "middle" }}
                              >
                                <textarea
                                  value={
                                    editedComments[
                                      idx + (masterSheetPage - 1) * rowsPerPage
                                    ] ??
                                    row[col] ??
                                    ""
                                  }
                                  placeholder="Add comment"
                                  onChange={(e) =>
                                    handleCommentChange(
                                      idx + (masterSheetPage - 1) * rowsPerPage,
                                      e.target.value
                                    )
                                  }
                                  className="border rounded px-2 py-1 w-48 h-16 resize-vertical"
                                  style={{ minHeight: 80 }}
                                />
                                <Button
                                  size="sm"
                                  className="ml-2"
                                  disabled={
                                    savingRow ===
                                    idx + (masterSheetPage - 1) * rowsPerPage
                                  }
                                  onClick={() =>
                                    handleSaveComment(
                                      idx + (masterSheetPage - 1) * rowsPerPage
                                    )
                                  }
                                >
                                  Save
                                </Button>
                              </TableCell>
                            );
                          }
                          return <TableCell key={col}>{row[col]}</TableCell>;
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination Controls */}
                <div className="flex items-center justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={masterSheetPage === 1}
                    onClick={() =>
                      setMasterSheetPage((p) => Math.max(1, p - 1))
                    }
                  >
                    &lt;
                  </Button>
                  <span>
                    Page {masterSheetPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={masterSheetPage === totalPages}
                    onClick={() =>
                      setMasterSheetPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* PPT Section */}
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setShowPpt((v) => !v)}
              className="mb-2"
            >
              PPT Data {showPpt ? "▲" : "▼"}
            </Button>
{showPpt && milestone.pptData && (
  <div>
    <ul className="list-disc ml-4">
      {milestone.pptData.map((slide: any, index: number) => (
        <li key={index} className="mb-2">
          <strong>{slide.title}</strong>
          <ul className="ml-4 list-disc">
            {slide.bullets.map((bullet: string, idx: number) => {
              // Check if bullet is an image URL (for IMG 1/IMG 2)
              const isImgBullet =
                typeof bullet === "string" &&
                (bullet.startsWith("IMG 1: http") ||
                  bullet.startsWith("IMG 2: http"));
              if (isImgBullet) {
                // Extract URL after 'IMG 1: ' or 'IMG 2: '
                const url = bullet.replace(/^IMG [12]:\s*/, "");
                return (
                  <li key={idx}>
                    <img
                      src={url}
                      alt={`ppt-img-${idx}`}
                      style={{
                        width: 100,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 4,
                        marginTop: 4,
                        marginBottom: 4,
                      }}
                      onError={e =>
                        (e.currentTarget.src =
                          "https://via.placeholder.com/100x60?text=No+Image")
                      }
                    />
                  </li>
                );
              }
              return <li key={idx}>{bullet}</li>;
            })}
          </ul>
        </li>
      ))}
    </ul>
  </div>
)}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MilestoneView;
