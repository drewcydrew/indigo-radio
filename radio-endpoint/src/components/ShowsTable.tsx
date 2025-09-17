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
        <div style={{ display: "flex", gap: "4px", alignItems: "flex-start" }}>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, show, column)}
            style={{
              width: "100%",
              minHeight: "60px",
              padding: "4px",
              border: "1px solid #007bff",
              borderRadius: "2px",
              fontSize: "14px",
              resize: "vertical",
              fontFamily: "inherit",
            }}
            autoFocus
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <button
              onClick={() => handleCellSave(show, column)}
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
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
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
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Shows</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
            Click any cell to edit
          </p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {showAddForm ? "Cancel" : "Add Show"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0" }}>Add New Show</h3>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="Show name"
              value={newShow.name}
              onChange={(e) =>
                setNewShow((prev) => ({ ...prev, name: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <textarea
              placeholder="Description"
              value={newShow.description}
              onChange={(e) =>
                setNewShow((prev) => ({ ...prev, description: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                minHeight: "60px",
                resize: "vertical",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleAddShow}
              disabled={addingShow}
              style={{
                padding: "8px 16px",
                backgroundColor: addingShow ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: addingShow ? "not-allowed" : "pointer",
              }}
            >
              {addingShow ? "Adding..." : "Add Show"}
            </button>
            <button
              onClick={handleCancelAdd}
              disabled={addingShow}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: addingShow ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {shows.length === 0 ? (
        <p>No shows available.</p>
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
                  Show Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  Description
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
              {shows.map((show, index) => (
                <tr key={show.id}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {show.id}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderEditableCell(show, "name", show.name, index + 2000)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderEditableCell(
                      show,
                      "description",
                      show.description,
                      index + 2000
                    )}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <button
                      onClick={() => handleDeleteShow(show)}
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
