"use client";

import { useState } from "react";

interface ShowEntry {
  id: number;
  name: string;
  description: string;
}

interface ShowsTableProps {
  shows: ShowEntry[];
  setShows: React.Dispatch<React.SetStateAction<ShowEntry[]>>;
}

export default function ShowsTable({ shows, setShows }: ShowsTableProps) {
  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [savingCell, setSavingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingShow, setAddingShow] = useState(false);
  const [newShow, setNewShow] = useState({
    name: "",
    description: "",
  });

  const handleCellEdit = (
    rowIndex: number,
    column: string,
    currentValue: string
  ) => {
    setEditingCell({ row: rowIndex, column });
    setEditValue(currentValue || "");
  };

  const handleCellSave = async (show: ShowEntry, column: string) => {
    if (!editingCell) return;

    setSavingCell({ row: editingCell.row, column });

    try {
      const updatedData = {
        ...show,
        [column]: editValue,
      };

      const response = await fetch(`/api/shows/shows/${show.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Server responded with status ${response.status}`
        );
      }

      setShows((prev) =>
        prev.map((s) => (s.id === show.id ? { ...s, [column]: editValue } : s))
      );

      setEditingCell(null);
      setEditValue("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update show");
    } finally {
      setSavingCell(null);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    show: ShowEntry,
    column: string
  ) => {
    if (e.key === "Enter") {
      handleCellSave(show, column);
    } else if (e.key === "Escape") {
      handleCellCancel();
    }
  };

  const renderEditableCell = (
    show: ShowEntry,
    column: string,
    value: string,
    rowIndex: number
  ) => {
    const isEditing =
      editingCell?.row === rowIndex && editingCell?.column === column;
    const isSaving =
      savingCell?.row === rowIndex && savingCell?.column === column;

    if (isEditing) {
      return (
        <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, show, column)}
            style={{
              width: "100%",
              minHeight: "60px",
              padding: "8px 12px",
              border: "2px solid #6366f1",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "vertical",
              fontFamily: "inherit",
              outline: "none",
              boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
            }}
            autoFocus
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button
              onClick={() => handleCellSave(show, column)}
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
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          transition: "all 0.15s ease",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = "#f9fafb";
          target.style.borderColor = "#374151";
          target.style.color = "#1f2937";
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = "transparent";
          target.style.borderColor = "transparent";
          target.style.color = "inherit";
        }}
        title={`Click to edit ${
          column === "name" ? "show name" : "description"
        }`}
      >
        {value || (
          <span
            style={{
              color: "#94a3b8",
              fontStyle: "italic",
              fontSize: "13px",
            }}
          >
            Click to {column === "name" ? "add show name" : "add description"}
          </span>
        )}
      </div>
    );
  };

  const handleAddShow = async () => {
    if (!newShow.name.trim()) {
      alert("Please fill in show name");
      return;
    }

    setAddingShow(true);
    try {
      const response = await fetch("/api/shows/shows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newShow),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add show");
      }

      const result = await response.json();

      setShows((prev) => [...prev, result.show]);

      setNewShow({ name: "", description: "" });
      setShowAddForm(false);

      alert("Show added successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add show");
    } finally {
      setAddingShow(false);
    }
  };

  const handleCancelAdd = () => {
    setNewShow({ name: "", description: "" });
    setShowAddForm(false);
  };

  const handleDeleteShow = async (show: ShowEntry) => {
    if (!confirm(`Are you sure you want to delete "${show.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/shows/shows/${show.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete show");
      }

      setShows((prev) => prev.filter((s) => s.id !== show.id));

      alert("Show deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete show");
    }
  };

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
            Shows
          </h2>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Manage radio show information and descriptions
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
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
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: "10px 20px",
              backgroundColor: showAddForm ? "#6b7280" : "#10b981",
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
            {showAddForm ? "Cancel" : "Add Show"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "24px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              color: "#1f2937",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Add New Show
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Show name"
              value={newShow.name}
              onChange={(e) =>
                setNewShow((prev) => ({ ...prev, name: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease",
                backgroundColor: "#ffffff",
                color: "#1f2937",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <textarea
              placeholder="Description"
              value={newShow.description}
              onChange={(e) =>
                setNewShow((prev) => ({ ...prev, description: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                minHeight: "80px",
                resize: "vertical",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease",
                backgroundColor: "#ffffff",
                color: "#1f2937",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleAddShow}
              disabled={addingShow}
              style={{
                padding: "10px 20px",
                backgroundColor: addingShow ? "#9ca3af" : "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: addingShow ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.15s ease",
              }}
            >
              {addingShow ? "Adding..." : "Add Show"}
            </button>
            <button
              onClick={handleCancelAdd}
              disabled={addingShow}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: addingShow ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {shows.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            No shows available. Create your first show to get started.
          </p>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "700px",
              borderCollapse: "collapse",
              backgroundColor: "#ffffff",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th
                  title="Unique identifier for each show"
                  style={{
                    width: "80px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#374151",
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
                  title="The name of the radio show - click to edit"
                  style={{
                    width: "200px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "help",
                  }}
                >
                  Show Name
                </th>
                <th
                  title="Description of the show's content and format - click to edit"
                  style={{
                    width: "250px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "help",
                  }}
                >
                  Description
                </th>
                <th
                  title="Available actions for this show"
                  style={{
                    width: "100px",
                    padding: "16px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#374151",
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
              {shows.map((show, index) => (
                <tr
                  key={show.id}
                  style={{
                    borderBottom:
                      index === shows.length - 1 ? "none" : "1px solid #e2e8f0",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).closest(
                      "tr"
                    )!.style.backgroundColor = "#f9fafb";
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
                    #{show.id}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      overflow: "hidden",
                      color: "#1f2937",
                    }}
                  >
                    {renderEditableCell(show, "name", show.name, index + 2000)}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      overflow: "hidden",
                      color: "#1f2937",
                    }}
                  >
                    {renderEditableCell(
                      show,
                      "description",
                      show.description,
                      index + 2000
                    )}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      border: "none",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => handleDeleteShow(show)}
                      title={`Delete "${show.name}" show`}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        transition: "all 0.15s ease",
                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor =
                          "#dc2626";
                        (e.target as HTMLElement).style.boxShadow =
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor =
                          "#ef4444";
                        (e.target as HTMLElement).style.boxShadow =
                          "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
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
