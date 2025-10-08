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
            style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}
          >
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "2px solid #6366f1",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <button
                onClick={() => handleProgrammeCellSave(programme, column)}
                disabled={isSaving}
                style={{
                  padding: "6px 10px",
                  backgroundColor: isSaving ? "#9ca3af" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  transition: "background-color 0.15s ease",
                }}
              >
                {isSaving ? "..." : "✓"}
              </button>
              <button
                onClick={handleCellCancel}
                disabled={isSaving}
                style={{
                  padding: "6px 10px",
                  backgroundColor: isSaving ? "#9ca3af" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  transition: "background-color 0.15s ease",
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
            style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}
          >
            <input
              type="time"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "2px solid #6366f1",
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
              }}
              autoFocus
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <button
                onClick={() => handleProgrammeCellSave(programme, column)}
                disabled={isSaving}
                style={{
                  padding: "6px 10px",
                  backgroundColor: isSaving ? "#9ca3af" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  transition: "background-color 0.15s ease",
                }}
              >
                {isSaving ? "..." : "✓"}
              </button>
              <button
                onClick={handleCellCancel}
                disabled={isSaving}
                style={{
                  padding: "6px 10px",
                  backgroundColor: isSaving ? "#9ca3af" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  transition: "background-color 0.15s ease",
                }}
              >
                ✗
              </button>
            </div>
          </div>
        );
      }

      return (
        <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "2px solid #6366f1",
              borderRadius: "6px",
              fontSize: "14px",
              fontFamily: "inherit",
              outline: "none",
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
            }}
            autoFocus
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button
              onClick={() => handleProgrammeCellSave(programme, column)}
              disabled={isSaving}
              style={{
                padding: "6px 10px",
                backgroundColor: isSaving ? "#9ca3af" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "500",
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              {isSaving ? "..." : "✓"}
            </button>
            <button
              onClick={handleCellCancel}
              disabled={isSaving}
              style={{
                padding: "6px 10px",
                backgroundColor: isSaving ? "#9ca3af" : "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "500",
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: "background-color 0.15s ease",
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
          padding: "8px 12px",
          minHeight: "32px",
          borderRadius: "4px",
          backgroundColor: "transparent",
          textTransform: column === "day" ? "capitalize" : "none",
          transition: "all 0.15s ease",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = "#1f2937";
          target.style.borderColor = "#374151";
          target.style.color = "white";
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = "transparent";
          target.style.borderColor = "transparent";
          target.style.color = "inherit";
        }}
        title={`Click to edit ${column}`}
      >
        {value || (
          <span
            style={{
              color: "#94a3b8",
              fontStyle: "italic",
              fontSize: "13px",
            }}
          >
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
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #374151",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 4px 0",
              color: "#111827",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            Programme Schedule
          </h2>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Manage daily programme schedules and time slots
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              htmlFor="dayFilter"
              style={{
                fontSize: "13px",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              Filter by day:
            </label>
            <select
              id="dayFilter"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #374151",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#1f2937",
                color: "white",
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
          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: 0,
              fontWeight: "500",
            }}
          >
            Click any cell to edit
          </p>
          <button
            onClick={() => setShowAddProgrammeForm(!showAddProgrammeForm)}
            style={{
              padding: "10px 20px",
              backgroundColor: showAddProgrammeForm ? "#6b7280" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            {showAddProgrammeForm ? "Cancel" : "Add Programme"}
          </button>
        </div>
      </div>

      {showAddProgrammeForm && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "24px",
            border: "1px solid #374151",
            borderRadius: "8px",
            backgroundColor: "#1f2937",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              color: "white",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Add New Programme
          </h3>
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
                border: "2px solid #374151",
                borderRadius: "6px",
                backgroundColor: "#111827",
                color: "white",
                fontSize: "14px",
                transition: "border-color 0.15s ease",
                outline: "none",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
              }}
            />
            <select
              value={newProgramme.day}
              onChange={(e) =>
                setNewProgramme((prev) => ({ ...prev, day: e.target.value }))
              }
              style={{
                padding: "8px",
                border: "2px solid #374151",
                borderRadius: "6px",
                backgroundColor: "#111827",
                color: "white",
                fontSize: "14px",
                transition: "border-color 0.15s ease",
                outline: "none",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
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
                border: "2px solid #374151",
                borderRadius: "6px",
                backgroundColor: "#111827",
                color: "white",
                fontSize: "14px",
                transition: "border-color 0.15s ease",
                outline: "none",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
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
                border: "2px solid #374151",
                borderRadius: "6px",
                backgroundColor: "#111827",
                color: "white",
                fontSize: "14px",
                transition: "border-color 0.15s ease",
                outline: "none",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleAddProgramme}
              disabled={addingProgramme}
              style={{
                padding: "10px 20px",
                backgroundColor: addingProgramme ? "#6c757d" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: addingProgramme ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.15s ease",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
            >
              {addingProgramme ? "Adding..." : "Add Programme"}
            </button>
            <button
              onClick={handleCancelAddProgramme}
              disabled={addingProgramme}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: addingProgramme ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.15s ease",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
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
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            backgroundColor: "#1f2937",
            borderRadius: "8px",
            border: "1px solid #374151",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "white",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            {selectedDay === "all"
              ? "No programme entries available."
              : `No programmes found for "${
                  selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)
                }".`}
          </p>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            borderRadius: "8px",
            border: "1px solid #374151",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "800px",
              borderCollapse: "collapse",
              backgroundColor: "#111827",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1f2937" }}>
                <th
                  title="Unique identifier for each programme"
                  style={{
                    width: "80px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #374151",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "help",
                  }}
                >
                  ID
                </th>
                <th
                  title="The name of the programme - click to edit"
                  style={{
                    width: "250px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #374151",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "help",
                  }}
                >
                  Programme Name
                </th>
                <th
                  title="Day of the week when this programme airs - click to edit"
                  style={{
                    width: "120px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #374151",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "help",
                  }}
                >
                  Day
                </th>
                <th
                  title="Programme start time - click to edit"
                  style={{
                    width: "120px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #374151",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "help",
                  }}
                >
                  Start Time
                </th>
                <th
                  title="Programme end time - click to edit"
                  style={{
                    width: "120px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #374151",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "help",
                  }}
                >
                  End Time
                </th>
                <th
                  title="Available actions for this programme"
                  style={{
                    width: "100px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #374151",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "help",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProgrammes.map((programme, index) => (
                <tr
                  key={programme.id}
                  style={{
                    borderBottom:
                      index === filteredProgrammes.length - 1
                        ? "none"
                        : "1px solid #374151",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).closest(
                      "tr"
                    )!.style.backgroundColor = "#1f2937";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).closest(
                      "tr"
                    )!.style.backgroundColor = "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "16px",
                      border: "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "#9ca3af",
                      fontSize: "14px",
                      fontWeight: "500",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                    }}
                  >
                    #{programme.id}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      overflow: "hidden",
                      color: "white",
                    }}
                  >
                    {renderProgrammeEditableCell(
                      programme,
                      "name",
                      programme.name,
                      index + 1000
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      overflow: "hidden",
                      color: "white",
                    }}
                  >
                    {renderProgrammeEditableCell(
                      programme,
                      "day",
                      programme.day,
                      index + 1000
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      overflow: "hidden",
                      color: "white",
                    }}
                  >
                    {renderProgrammeEditableCell(
                      programme,
                      "startTime",
                      programme.startTime,
                      index + 1000
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      overflow: "hidden",
                      color: "white",
                    }}
                  >
                    {renderProgrammeEditableCell(
                      programme,
                      "endTime",
                      programme.endTime,
                      index + 1000
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "none",
                      overflow: "hidden",
                    }}
                  >
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
