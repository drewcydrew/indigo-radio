"use client";

import { useState } from "react";

interface PodcastEpisode {
  id: number;
  url: string;
  title: string;
  show: string;
  description: string;
}

interface PodcastTableProps {
  podcasts: PodcastEpisode[];
  setPodcasts: React.Dispatch<React.SetStateAction<PodcastEpisode[]>>;
  availableShows: string[];
  setAvailableShows: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PodcastTable({
  podcasts,
  setPodcasts,
  availableShows,
  setAvailableShows,
}: PodcastTableProps) {
  const [selectedShow, setSelectedShow] = useState<string>("all");
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
  const [addingEpisode, setAddingEpisode] = useState(false);
  const [newEpisode, setNewEpisode] = useState({
    id: "",
    url: "",
    title: "",
    show: "",
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

  const handleCellSave = async (episode: PodcastEpisode, column: string) => {
    if (!editingCell) return;

    setSavingCell({ row: editingCell.row, column });

    try {
      const updatedData = {
        ...episode,
        [column]: editValue,
      };

      const response = await fetch(`/api/shows/podcasts/${episode.id}`, {
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

      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === episode.id ? { ...p, [column]: editValue } : p
        )
      );

      setEditingCell(null);
      setEditValue("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update episode");
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
    episode: PodcastEpisode,
    column: string
  ) => {
    if (e.key === "Enter") {
      handleCellSave(episode, column);
    } else if (e.key === "Escape") {
      handleCellCancel();
    }
  };

  const renderEditableCell = (
    episode: PodcastEpisode,
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
            onKeyDown={(e) => handleKeyPress(e, episode, column)}
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
              onClick={() => handleCellSave(episode, column)}
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

  const handleAddPodcast = async () => {
    if (
      !newEpisode.id.trim() ||
      !newEpisode.url.trim() ||
      !newEpisode.title.trim() ||
      !newEpisode.show.trim()
    ) {
      alert("Please fill in ID, URL, Title, and Show fields");
      return;
    }

    setAddingEpisode(true);
    try {
      const response = await fetch("/api/shows/podcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEpisode),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add episode");
      }

      const result = await response.json();

      setPodcasts((prev) => [result.episode, ...prev]);

      if (
        result.episode.show &&
        !availableShows.includes(result.episode.show)
      ) {
        setAvailableShows((prev) => [...prev, result.episode.show].sort());
      }

      setNewEpisode({ id: "", url: "", title: "", show: "", description: "" });
      setShowAddForm(false);

      alert("Episode added successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add episode");
    } finally {
      setAddingEpisode(false);
    }
  };

  const handleCancelAddPodcast = () => {
    setNewEpisode({ id: "", url: "", title: "", show: "", description: "" });
    setShowAddForm(false);
  };

  const handleDeletePodcast = async (episode: PodcastEpisode) => {
    if (!confirm(`Are you sure you want to delete "${episode.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/shows/podcasts/${episode.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete episode");
      }

      setPodcasts((prev) => prev.filter((p) => p.id !== episode.id));

      const remainingEpisodes = podcasts.filter((p) => p.id !== episode.id);
      const remainingShows = Array.from(
        new Set(remainingEpisodes.map((ep) => ep.show))
      )
        .filter((show) => show && show.trim())
        .sort();
      setAvailableShows(remainingShows);

      if (selectedShow !== "all" && !remainingShows.includes(selectedShow)) {
        setSelectedShow("all");
      }

      alert("Episode deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete episode");
    }
  };

  const filteredPodcasts =
    selectedShow === "all"
      ? podcasts
      : podcasts.filter((episode) => episode.show === selectedShow);

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
        <h2 style={{ margin: 0 }}>Podcast Episodes</h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              htmlFor="showFilter"
              style={{ fontSize: "14px", color: "#666" }}
            >
              Filter by show:
            </label>
            <select
              id="showFilter"
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value="all">All Shows ({podcasts.length})</option>
              {availableShows.map((show) => {
                const count = podcasts.filter((ep) => ep.show === show).length;
                return (
                  <option key={show} value={show}>
                    {show} ({count})
                  </option>
                );
              })}
            </select>
          </div>
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
            {showAddForm ? "Cancel" : "Add Episode"}
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
          <h3 style={{ margin: "0 0 12px 0" }}>Add New Episode</h3>
          {/* ...existing form fields... */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 2fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <input
              type="text"
              placeholder="Episode ID"
              value={newEpisode.id}
              onChange={(e) =>
                setNewEpisode((prev) => ({ ...prev, id: e.target.value }))
              }
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Show name"
                value={newEpisode.show}
                onChange={(e) =>
                  setNewEpisode((prev) => ({ ...prev, show: e.target.value }))
                }
                list="showSuggestions"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <datalist id="showSuggestions">
                {availableShows.map((show) => (
                  <option key={show} value={show} />
                ))}
              </datalist>
            </div>
            <input
              type="text"
              placeholder="Episode title"
              value={newEpisode.title}
              onChange={(e) =>
                setNewEpisode((prev) => ({ ...prev, title: e.target.value }))
              }
              style={{
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="url"
              placeholder="Audio URL"
              value={newEpisode.url}
              onChange={(e) =>
                setNewEpisode((prev) => ({ ...prev, url: e.target.value }))
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
              value={newEpisode.description}
              onChange={(e) =>
                setNewEpisode((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
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
              onClick={handleAddPodcast}
              disabled={addingEpisode}
              style={{
                padding: "8px 16px",
                backgroundColor: addingEpisode ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: addingEpisode ? "not-allowed" : "pointer",
              }}
            >
              {addingEpisode ? "Adding..." : "Add Episode"}
            </button>
            <button
              onClick={handleCancelAddPodcast}
              disabled={addingEpisode}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: addingEpisode ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedShow !== "all" && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "8px",
            backgroundColor: "#e7f3ff",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: "#0066cc" }}>
            Showing {filteredPodcasts.length} episode(s) for "{selectedShow}"
            <button
              onClick={() => setSelectedShow("all")}
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

      {filteredPodcasts.length === 0 ? (
        <p>
          {selectedShow === "all"
            ? "No podcast episodes available."
            : `No episodes found for "${selectedShow}".`}
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
                  Show
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  Title
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
                  Audio
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                    color: "black",
                  }}
                >
                  URL
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
              {filteredPodcasts.map((episode, index) => (
                <tr key={episode.id}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {episode.id}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderEditableCell(episode, "show", episode.show, index)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderEditableCell(episode, "title", episode.title, index)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderEditableCell(
                      episode,
                      "description",
                      episode.description,
                      index
                    )}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <audio controls style={{ width: "200px" }}>
                      <source src={episode.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    {renderEditableCell(episode, "url", episode.url, index)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <button
                      onClick={() => handleDeletePodcast(episode)}
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
