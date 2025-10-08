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
        <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, episode, column)}
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
              onClick={() => handleCellSave(episode, column)}
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
            Podcast Episodes
          </h2>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Manage podcast episodes and audio content
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              htmlFor="showFilter"
              style={{
                fontSize: "13px",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              Filter by show:
            </label>
            <select
              id="showFilter"
              value={selectedShow}
              onChange={(e) => setSelectedShow(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #374151",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#1f2937",
                color: "white",
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
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              margin: 0,
            }}
          >
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
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#0066cc",
            }}
          >
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
            {selectedShow === "all"
              ? "No podcast episodes available."
              : `No episodes found for "${selectedShow}".`}
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
              minWidth: "1200px",
              borderCollapse: "collapse",
              backgroundColor: "#111827",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1f2937" }}>
                <th
                  title="Unique identifier for each episode"
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
                  style={{
                    width: "150px",
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
                  Show
                </th>
                <th
                  style={{
                    width: "200px",
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
                  Title
                </th>
                <th
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
                  Description
                </th>
                <th
                  style={{
                    width: "220px",
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
                  Audio
                </th>
                <th
                  style={{
                    width: "200px",
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
                  URL
                </th>
                <th
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
              {filteredPodcasts.map((episode, index) => (
                <tr
                  key={episode.id}
                  style={{
                    borderBottom:
                      index === filteredPodcasts.length - 1
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
                    #{episode.id}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      border: "none",
                      overflow: "hidden",
                    }}
                  >
                    {renderEditableCell(episode, "show", episode.show, index)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      border: "none",
                      overflow: "hidden",
                    }}
                  >
                    {renderEditableCell(episode, "title", episode.title, index)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      border: "none",
                      overflow: "hidden",
                    }}
                  >
                    {renderEditableCell(
                      episode,
                      "description",
                      episode.description,
                      index
                    )}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      border: "none",
                      overflow: "hidden",
                    }}
                  >
                    <audio
                      controls
                      style={{ width: "100%", maxWidth: "200px" }}
                    >
                      <source src={episode.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      border: "none",
                      overflow: "hidden",
                    }}
                  >
                    {renderEditableCell(episode, "url", episode.url, index)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      border: "none",
                      overflow: "hidden",
                    }}
                  >
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
