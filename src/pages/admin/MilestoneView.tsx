/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
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
import { toast } from "react-hot-toast";
import ImageCropModal from '../../components/ui/ImageCropModal';

const SUMMARY_COLUMNS = ["Type/Disciplin", "Units", "Summary"];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

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

  // Pagination
  const [masterSheetPage, setMasterSheetPage] = useState(1);
  const rowsPerPage = 7;

  // Row highlight and comment editing
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);
  const [editedComments, setEditedComments] = useState<{
    [rowIdx: number]: string;
  }>({});
  const [savingRow, setSavingRow] = useState<number | null>(null);
  const [selectedSummaryCell, setSelectedSummaryCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Debounced comments for auto-save
  const debouncedComments = useDebounce(editedComments, 800);

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

  // Auto-save comment when debounced value changes
  useEffect(() => {
    if (!milestone || !debouncedComments) return;
    const rowIdx = Number(Object.keys(debouncedComments)[0]);
    if (
      debouncedComments[rowIdx] !==
      (milestone.masterSheetData?.[rowIdx]?.["COMMENTS/REMARKS"] ?? "")
    ) {
      handleSaveComment(rowIdx, debouncedComments[rowIdx]);
    }
    // eslint-disable-next-line
  }, [debouncedComments]);

  const handleCommentChange = (idx: number, value: string) => {
    setEditedComments({ [idx]: value });
  };

  const handleSaveComment = async (rowIdx: number, value: string) => {
    setSavingRow(rowIdx);
    const updatedRows = [...masterSheetRows];
    updatedRows[rowIdx]["COMMENTS/REMARKS"] = value || "";
    try {
      await api.patch(`/api/milestones/${milestoneId}/master-sheet`, {
        masterSheetData: updatedRows,
      });
      setMilestone((prev: any) => ({
        ...prev,
        masterSheetData: updatedRows,
      }));
      if (value && value.trim().length > 0) {
        toast.success("Comment Created");
      } else {
        toast.success("Comment Removed");
      }
    } catch (e) {
      toast.error("Failed to save comment");
    }
    setSavingRow(null);
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

  // Use a ref object to store refs for each cell
  const imageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Helper to get the ref key for each cell
  const getRefKey = (rowIdx: number, colIdx: number) => `${rowIdx}-${colIdx}`;

  const [cropModalOpen, setCropModalOpen] = useState(false);
const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
const [pendingUploadInfo, setPendingUploadInfo] = useState<{
  rowIndex: number;
  colIdx: number;
  col: string;
} | null>(null);

  // CSV Download Utility
  function downloadCSV(data: any[], filename = "master_sheet.csv") {
    if (!data || data.length === 0) return;
    const columns = Object.keys(data[0]);
    const csvRows = [
      columns.join(","), // header
      ...data.map(row =>
        columns.map(col => `"${(row[col] ?? "").toString().replace(/"/g, '""')}"`).join(",")
      ),
    ];
    const csvContent = csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
                      ([type, { normals, total }], rowIdx) => (
                        <TableRow
                          key={type}
                          className={total ? "bg-gray-100 font-bold" : ""}
                        >
                          {[
                            total && total[2] !== undefined && total[2] !== null
                              ? String(total[2])
                              : type,
                            total && total[6] !== undefined && total[6] !== null
                              ? String(total[6])
                              : "",
                            total && total[9] !== undefined && total[9] !== null
                              ? String(total[9])
                              : "",
                          ].map((cell, colIdx) => (
                            <TableCell
                              key={colIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSummaryCell({
                                  row: rowIdx,
                                  col: colIdx,
                                });
                              }}
                              style={
                                selectedSummaryCell &&
                                selectedSummaryCell.row === rowIdx &&
                                selectedSummaryCell.col === colIdx
                                  ? { background: "#e0e7ff", cursor: "pointer" }
                                  : { cursor: "pointer" }
                              }
                            >
                              {cell}
                            </TableCell>
                          ))}
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
                        <TableHead
                          key={col}
                          style={
                            col.toLowerCase() === "img 1" ||
                            col.toLowerCase() === "img 2"
                              ? { minWidth: 240, width: 240, maxWidth: 240 }
                              : {}
                          }
                        >
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRows.map((row: any, idx: number) => (
                      <TableRow
                        key={idx + (masterSheetPage - 1) * rowsPerPage}
                        style={{
                          height: 120,
                          background:
                            selectedRowIdx ===
                            idx + (masterSheetPage - 1) * rowsPerPage
                              ? "#e0e7ff"
                              : undefined,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setSelectedRowIdx(
                            idx + (masterSheetPage - 1) * rowsPerPage
                          )
                        }
                      >
                        {masterSheetColumns.map((col, colIdx) => {
                          // For IMG 1 and IMG 2 columns, show thumbnail and set cell width
                          if (
  col.toLowerCase() === "img 1" ||
  col.toLowerCase() === "img 2"
) {
  const rowIndex = idx;
  const imageUrl = row[col];

  const handleButtonClick = () => {
    const refKey = `${rowIndex}-${colIdx}`;
    imageInputRefs.current[refKey]?.click();
  };

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImageSrc(ev.target?.result as string);
      setCropModalOpen(true);
      setPendingUploadInfo({ rowIndex, colIdx, col });
    };
    reader.readAsDataURL(file);
  };

  return (
    <TableCell
      key={col}
      style={{
        verticalAlign: "middle",
        minWidth: 240,
        width: 240,
        maxWidth: 240,
      }}
    >
      {imageUrl ? (
        <img
          src={
            imageUrl.startsWith("/uploads/")
              ? `${import.meta.env.VITE_API_URL || "http://localhost:4000"}${imageUrl}`
              : imageUrl
          }
          alt={`thumbnail-${col}-${idx}`}
          style={{
            width: 140,
            height: 140,
            objectFit: "cover",
            borderRadius: 4,
            display: "block",
            margin: "0 auto 8px auto",
            aspectRatio: "1/1",
          }}
          onError={(e) =>
            (e.currentTarget.src =
              "https://via.placeholder.com/140x140?text=No+Image")
          }
        />
      ) : (
        <div
          style={{
            width: 140,
            height: 140,
            background: "#f3f3f3",
            borderRadius: 4,
            margin: "0 auto 8px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            aspectRatio: "1/1",
          }}
        >
          No Image
        </div>
      )}
      <input
        ref={el =>
          (imageInputRefs.current[
            `${rowIndex}-${colIdx}`
          ] = el)
        }
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageSelect}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full mt-2"
        onClick={handleButtonClick}
      >
        {imageUrl ? "Change Image" : "Upload Image"}
      </Button>
    </TableCell>
  );
}

// For comments/remarks columns, show editable textarea (auto-save)
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
                                  className="border rounded px-2 py-1 w-48 h-24 resize-vertical"
                                  style={{ minHeight: 80 }}
                                  disabled={
                                    savingRow ===
                                    idx + (masterSheetPage - 1) * rowsPerPage
                                  }
                                />
                              </TableCell>
                            );
                          }
                          // Default cell
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
                {/* Download CSV Button */}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadCSV(milestone.masterSheetData, "master_sheet.csv")
                    }
                  >
                    Download Master Sheet CSV
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
                                  onError={(e) =>
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