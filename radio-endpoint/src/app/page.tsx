"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface PodcastEpisode {
  id: number;
  url: string;
  title: string;
  show: string;
  description: string;
}

interface RadioData {
  radioAddress: string;
}

export default function Home() {
  const [radioAddress, setRadioAddress] = useState<string>("");
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editAddress, setEditAddress] = useState<string>("");
  const [updating, setUpdating] = useState(false);
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
  const [selectedShow, setSelectedShow] = useState<string>("all");
  const [availableShows, setAvailableShows] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [radioResponse, podcastResponse] = await Promise.all([
          fetch("/api/shows/radioaddress"),
          fetch("/api/shows/podcasts"),
        ]);

        if (!radioResponse.ok || !podcastResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const radioData: RadioData = await radioResponse.json();
        const podcastData: PodcastEpisode[] = await podcastResponse.json();

        setRadioAddress(radioData.radioAddress);
        setPodcasts(podcastData);

        // Extract unique show names for filtering
        const uniqueShows = Array.from(
          new Set(podcastData.map((episode) => episode.show))
        )
          .filter((show) => show && show.trim())
          .sort();
        setAvailableShows(uniqueShows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = () => {
    setEditAddress(radioAddress);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditAddress("");
  };

  const handleSaveAddress = async () => {
    if (!editAddress.trim()) {
      alert("Please enter a valid address");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch("/api/shows/radioaddress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: editAddress.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update address");
      }

      setRadioAddress(editAddress.trim());
      setIsEditing(false);
      setEditAddress("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update address");
    } finally {
      setUpdating(false);
    }
  };

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

      console.log(
        "Sending update request for episode:",
        episode.id,
        "column:",
        column,
        "value:",
        editValue
      );

      const response = await fetch(`/api/shows/podcasts/${episode.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          errorData.error || `Server responded with status ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Update successful:", result);

      // Update local state
      setPodcasts((prev) =>
        prev.map((p) =>
          p.id === episode.id ? { ...p, [column]: editValue } : p
        )
      );

      setEditingCell(null);
      setEditValue("");
    } catch (err) {
      console.error("Update error:", err);
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

  const handleAddRow = async () => {
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
      console.log("Sending new episode data:", newEpisode);

      const response = await fetch("/api/shows/podcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEpisode),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to add episode");
      }

      const result = await response.json();
      console.log("Add episode result:", result);

      // Add the new episode to local state
      setPodcasts((prev) => [result.episode, ...prev]);

      // Update available shows if this is a new show
      if (
        result.episode.show &&
        !availableShows.includes(result.episode.show)
      ) {
        setAvailableShows((prev) => [...prev, result.episode.show].sort());
      }

      // Reset form and close it
      setNewEpisode({ id: "", url: "", title: "", show: "", description: "" });
      setShowAddForm(false);

      alert("Episode added successfully!");
    } catch (err) {
      console.error("Add episode error:", err);
      alert(err instanceof Error ? err.message : "Failed to add episode");
    } finally {
      setAddingEpisode(false);
    }
  };

  const handleCancelAdd = () => {
    setNewEpisode({ id: "", url: "", title: "", show: "", description: "" });
    setShowAddForm(false);
  };

  const handleDeleteRow = async (episode: PodcastEpisode) => {
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

      // Remove from local state
      setPodcasts((prev) => prev.filter((p) => p.id !== episode.id));

      // Update available shows if no more episodes exist for this show
      const remainingEpisodes = podcasts.filter((p) => p.id !== episode.id);
      const remainingShows = Array.from(
        new Set(remainingEpisodes.map((ep) => ep.show))
      )
        .filter((show) => show && show.trim())
        .sort();
      setAvailableShows(remainingShows);

      // Reset filter if the selected show no longer exists
      if (selectedShow !== "all" && !remainingShows.includes(selectedShow)) {
        setSelectedShow("all");
      }

      alert("Episode deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete episode");
    }
  };

  // Filter podcasts based on selected show
  const filteredPodcasts =
    selectedShow === "all"
      ? podcasts
      : podcasts.filter((episode) => episode.show === selectedShow);

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Loading...</h1>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Error: {error}</h1>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Indigo Radio Dashboard</h1>

        <section style={{ marginBottom: "2rem" }}>
          <h2>Live Radio Stream</h2>
          {isEditing ? (
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  padding: "8px",
                  marginBottom: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
                placeholder="Enter streaming address"
              />
              <div>
                <button
                  onClick={handleSaveAddress}
                  disabled={updating}
                  style={{
                    padding: "8px 16px",
                    marginRight: "8px",
                    backgroundColor: "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: updating ? "not-allowed" : "pointer",
                  }}
                >
                  {updating ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={updating}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#666",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: updating ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p>
                <strong>Stream URL:</strong> {radioAddress}
                <button
                  onClick={handleEditClick}
                  style={{
                    marginLeft: "12px",
                    padding: "4px 8px",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </p>
            </div>
          )}
        </section>

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2>Podcast Episodes</h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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
                    const count = podcasts.filter(
                      (ep) => ep.show === show
                    ).length;
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
                      setNewEpisode((prev) => ({
                        ...prev,
                        show: e.target.value,
                      }))
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
                    setNewEpisode((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
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
                  onClick={handleAddRow}
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
                  onClick={handleCancelAdd}
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
                Showing {filteredPodcasts.length} episode(s) for "{selectedShow}
                "
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
                        {renderEditableCell(
                          episode,
                          "show",
                          episode.show,
                          index
                        )}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {renderEditableCell(
                          episode,
                          "title",
                          episode.title,
                          index
                        )}
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
                          onClick={() => handleDeleteRow(episode)}
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
        </section>
      </main>
    </div>
  );
}
