"use client";

import { useState } from "react";

interface ProgrammeEntry {
  id: number;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface ProgrammeTableProps {
  programmes: ProgrammeEntry[];
  setProgrammes: React.Dispatch<React.SetStateAction<ProgrammeEntry[]>>;
  availableDays: string[];
  setAvailableDays: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ProgrammeTable({
  programmes,
  setProgrammes,
  availableDays,
  setAvailableDays,
}: ProgrammeTableProps) {
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [savingCell, setSavingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);
  const [showAddProgrammeForm, setShowAddProgrammeForm] = useState(false);
  const [addingProgramme, setAddingProgramme] = useState(false);
  const [newProgramme, setNewProgramme] = useState({
    name: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  const handleCellEdit = (
    rowIndex: number,
    column: string,
    currentValue: string
  ) => {
    setEditingCell({ row: rowIndex, column });
    setEditValue(currentValue || "");
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleProgrammeCellSave = async (
    programme: ProgrammeEntry,
    column: string
  ) => {
    if (!editingCell) return;

    setSavingCell({ row: editingCell.row, column });

    try {
      const updatedData = {
        ...programme,
        [column]: editValue,
      };

      const response = await fetch(`/api/shows/programme/${programme.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update programme");
      }

      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === programme.id ? { ...p, [column]: editValue } : p
        )
      );

      setEditingCell(null);
      setEditValue("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update programme");
    } finally {
      setSavingCell(null);
    }
  };

  const renderProgrammeEditableCell = (
    programme: ProgrammeEntry,
    column: string,
    value: string,
    rowIndex: number
  ) => {
    const isEditing =
      editingCell?.row === rowIndex && editingCell?.column === column;
    const isSaving =
      savingCell?.row === rowIndex && savingCell?.column === column;

    if (isEditing) {
      if (column === "day") {
        return (
          <div
            style={{ display: "flex", gap: "4px", alignItems: "flex-start" }}
          >
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #007bff",
                borderRadius: "2px",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
              autoFocus
            >
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            {/* ...existing button controls... */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <button
                onClick={() => handleProgrammeCellSave(programme, column)}
                disabled={isSaving}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "2px",
                  fontSize: "12px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                ✓
              </button>
              <button
                onClick={handleCellCancel}
                disabled={isSaving}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "2px",
                  fontSize: "12px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                ✗
              </button>
            </div>
          </div>
        );
      }

      if (column === "startTime" || column === "endTime") {
        return (
          <div
            style={{ display: "flex", gap: "4px", alignItems: "flex-start" }}
          >
            <input
              type="time"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: "100%",
                padding: "4px",
                border: "1px solid #007bff",
                borderRadius: "2px",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
              autoFocus
            />
            {/* ...existing button controls... */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <button
                onClick={() => handleProgrammeCellSave(programme, column)}
                disabled={isSaving}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "2px",
                  fontSize: "12px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                ✓
              </button>
              <button
                onClick={handleCellCancel}
                disabled={isSaving}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "2px",
                  fontSize: "12px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                ✗
              </button>
            </div>
          </div>
        );
      }

      return (
        <div style={{ display: "flex", gap: "4px", alignItems: "flex-start" }}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              width: "100%",
              padding: "4px",
              border: "1px solid #007bff",
              borderRadius: "2px",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
            autoFocus
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <button
              onClick={() => handleProgrammeCellSave(programme, column)}
              disabled={isSaving}
              style={{
                padding: "4px 8px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "2px",
                fontSize: "12px",
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              ✓
            </button>
            <button
              onClick={handleCellCancel}
              disabled={isSaving}
              style={{
                padding: "4px 8px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "2px",
                fontSize: "12px",
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              ✗
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => handleCellEdit(rowIndex, column, value)}
        style={{
          cursor: "pointer",
          padding: "4px",
          minHeight: "20px",
          borderRadius: "2px",
          backgroundColor: "transparent",
          textTransform: column === "day" ? "capitalize" : "none",
        }}
        onMouseEnter={(e) =>
          ((e.target as HTMLElement).style.backgroundColor = "#f8f9fa")
        }
        onMouseLeave={(e) =>
          ((e.target as HTMLElement).style.backgroundColor = "transparent")
        }
        title="Click to edit"
      >
        {value || (
          <span style={{ color: "#999", fontStyle: "italic" }}>
            Click to edit
          </span>
        )}
      </div>
    );
  };

  const handleAddProgramme = async () => {
    if (
      !newProgramme.name.trim() ||
      !newProgramme.day.trim() ||
      !newProgramme.startTime.trim() ||
      !newProgramme.endTime.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    setAddingProgramme(true);
    try {
      const response = await fetch("/api/shows/programme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProgramme),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add programme");
      }

      const result = await response.json();

      setProgrammes((prev) => [...prev, result.programme]);

      if (
        result.programme.day &&
        !availableDays.includes(result.programme.day)
      ) {
        setAvailableDays((prev) => [...prev, result.programme.day].sort());
      }

      setNewProgramme({ name: "", day: "", startTime: "", endTime: "" });
      setShowAddProgrammeForm(false);

      alert("Programme added successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add programme");
    } finally {
      setAddingProgramme(false);
    }
  };

  const handleCancelAddProgramme = () => {
    setNewProgramme({ name: "", day: "", startTime: "", endTime: "" });
    setShowAddProgrammeForm(false);
  };

  const handleDeleteProgramme = async (programme: ProgrammeEntry) => {
    if (!confirm(`Are you sure you want to delete "${programme.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/shows/programme/${programme.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete programme");
      }

      setProgrammes((prev) => prev.filter((p) => p.id !== programme.id));

      const remainingProgrammes = programmes.filter(
        (p) => p.id !== programme.id
      );
      const remainingDays = Array.from(
        new Set(remainingProgrammes.map((prog) => prog.day))
      )
        .filter((day) => day && day.trim())
        .sort();
      setAvailableDays(remainingDays);

      if (selectedDay !== "all" && !remainingDays.includes(selectedDay)) {
        setSelectedDay("all");
      }

      alert("Programme deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete programme");
    }
  };

  const filteredProgrammes =
    selectedDay === "all"
      ? programmes
      : programmes.filter((programme) => programme.day === selectedDay);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Programme Schedule</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              htmlFor="dayFilter"
              style={{ fontSize: "14px", color: "#666" }}
            >
              Filter by day:
            </label>
            <select
              id="dayFilter"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value="all">All Days ({programmes.length})</option>
              {availableDays.map((day) => {
                const count = programmes.filter(
                  (prog) => prog.day === day
                ).length;
                return (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)} ({count})
                  </option>
                );
              })}
            </select>
          </div>
          <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
            Click any cell to edit
          </p>
          <button
            onClick={() => setShowAddProgrammeForm(!showAddProgrammeForm)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {showAddProgrammeForm ? "Cancel" : "Add Programme"}
          </button>
        </div>
      </div>

      {showAddProgrammeForm && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0" }}>Add New Programme</h3>
          {/* ...existing form fields... */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <input
              type="text"
              placeholder="Programme name"
              value={newProgramme.name}
              onChange={(e) =>
                setNewProgramme((prev) => ({ ...prev, name: e.target.value }))
              }
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <select
              value={newProgramme.day}
              onChange={(e) =>
                setNewProgramme((prev) => ({ ...prev, day: e.target.value }))
              }
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="">Select day</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            <input
              type="time"
              placeholder="Start time"
              value={newProgramme.startTime}
              onChange={(e) =>
                setNewProgramme((prev) => ({
                  ...prev,
                  startTime: e.target.value,
                }))
              }
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <input
              type="time"
              placeholder="End time"
              value={newProgramme.endTime}
              onChange={(e) =>
                setNewProgramme((prev) => ({
                  ...prev,
                  endTime: e.target.value,
                }))
              }
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleAddProgramme}
              disabled={addingProgramme}
              style={{
                padding: "8px 16px",
                backgroundColor: addingProgramme ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: addingProgramme ? "not-allowed" : "pointer",
              }}
            >
              {addingProgramme ? "Adding..." : "Add Programme"}
            </button>
            <button
              onClick={handleCancelAddProgramme}
              disabled={addingProgramme}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: addingProgramme ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedDay !== "all" && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "8px",
            backgroundColor: "#e7f3ff",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: "#0066cc" }}>
            Showing {filteredProgrammes.length} programme(s) for "
            {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}"
            <button
              onClick={() => setSelectedDay("all")}
              style={{
                marginLeft: "8px",
                padding: "2px 6px",
                backgroundColor: "transparent",
                color: "#0066cc",
                border: "1px solid #0066cc",
                borderRadius: "2px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Clear filter
            </button>
          </p>
        </div>
      )}

      {filteredProgrammes.length === 0 ? (
        <p>
          {selectedDay === "all"
            ? "No programme entries available."
            : `No programmes found for "${
                selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)
              }".`}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  Programme Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  Day
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  Start Time
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  End Time
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProgrammes.map((programme, index) => (
                <tr key={programme.id}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {programme.id}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderProgrammeEditableCell(
                      programme,
                      "name",
                      programme.name,
                      index + 1000
                    )}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderProgrammeEditableCell(
                      programme,
                      "day",
                      programme.day,
                      index + 1000
                    )}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderProgrammeEditableCell(
                      programme,
                      "startTime",
                      programme.startTime,
                      index + 1000
                    )}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderProgrammeEditableCell(
                      programme,
                      "endTime",
                      programme.endTime,
                      index + 1000
                    )}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <button
                      onClick={() => handleDeleteProgramme(programme)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
