"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import PodcastTable from "../components/PodcastTable";
import ProgrammeTable from "../components/ProgrammeTable";
import ShowsTable from "../components/ShowsTable";

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

interface ProgrammeEntry {
  id: number;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface ShowEntry {
  id: number;
  name: string;
  description: string;
}

export default function Home() {
  const [radioAddress, setRadioAddress] = useState<string>("");
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeEntry[]>([]);
  const [shows, setShows] = useState<ShowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editAddress, setEditAddress] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "podcasts" | "programmes" | "shows"
  >("podcasts");
  const [availableShows, setAvailableShows] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          radioResponse,
          podcastResponse,
          programmeResponse,
          showsResponse,
        ] = await Promise.all([
          fetch("/api/shows/radioaddress"),
          fetch("/api/shows/podcasts"),
          fetch("/api/shows/programme"),
          fetch("/api/shows/shows"),
        ]);

        if (
          !radioResponse.ok ||
          !podcastResponse.ok ||
          !programmeResponse.ok ||
          !showsResponse.ok
        ) {
          throw new Error("Failed to fetch data");
        }

        const radioData: RadioData = await radioResponse.json();
        const podcastData: PodcastEpisode[] = await podcastResponse.json();
        const programmeData: ProgrammeEntry[] = await programmeResponse.json();
        const showsData: ShowEntry[] = await showsResponse.json();

        setRadioAddress(radioData.radioAddress);
        setPodcasts(podcastData);
        setProgrammes(programmeData);
        setShows(showsData);

        // Extract unique show names for filtering
        const uniqueShows = Array.from(
          new Set(podcastData.map((episode) => episode.show))
        )
          .filter((show) => show && show.trim())
          .sort();
        setAvailableShows(uniqueShows);

        // Extract unique days for filtering
        const uniqueDays = Array.from(
          new Set(programmeData.map((programme) => programme.day))
        )
          .filter((day) => day && day.trim())
          .sort();
        setAvailableDays(uniqueDays);
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

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              padding: "0 40px 0 20px",
              boxSizing: "border-box",
            }}
          >
            <h1>Loading...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              padding: "0 40px 0 20px",
              boxSizing: "border-box",
            }}
          >
            <h1>Error: {error}</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            padding: "0 40px 0 20px",
            boxSizing: "border-box",
            margin: "0",
          }}
        >
          <header style={{ marginBottom: "2rem" }}>
            <h1 style={{ margin: "0 0 2rem 0" }}>Indigo Radio Dashboard</h1>

            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ margin: "0 0 1rem 0" }}>Live Radio Stream</h2>
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
                      boxSizing: "border-box",
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
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: updating ? "not-allowed" : "pointer",
                        fontWeight: "500",
                      }}
                    >
                      {updating ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={updating}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: updating ? "not-allowed" : "pointer",
                        fontWeight: "500",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: "600",
                      minWidth: "100px",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      paddingTop: "12px",
                    }}
                  >
                    Stream URL:
                  </span>
                  <div
                    onClick={handleEditClick}
                    title="Click to edit the radio stream URL. This URL is used by the app to retrieve the live radio stream for playback."
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      backgroundColor: radioAddress ? "#ffffff" : "#fef3c7",
                      border: `1px solid ${
                        radioAddress ? "#d1d5db" : "#f59e0b"
                      }`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.15s ease-in-out",
                      wordBreak: "break-all",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                      position: "relative",
                      maxWidth: "calc(100% - 112px)",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = radioAddress
                        ? "#f9fafb"
                        : "#fef3c7";
                      target.style.borderColor = radioAddress
                        ? "#6366f1"
                        : "#f59e0b";
                      target.style.boxShadow = radioAddress
                        ? "0 0 0 3px rgba(99, 102, 241, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        : "0 0 0 3px rgba(245, 158, 11, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = radioAddress
                        ? "#ffffff"
                        : "#fef3c7";
                      target.style.borderColor = radioAddress
                        ? "#d1d5db"
                        : "#f59e0b";
                      target.style.boxShadow =
                        "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                    }}
                  >
                    {radioAddress ? (
                      <span
                        style={{
                          color: "#374151",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
                        }}
                      >
                        {radioAddress}
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#92400e",
                          fontStyle: "italic",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "16px",
                            color: "#f59e0b",
                          }}
                        >
                          ⚠
                        </span>
                        No stream URL configured - Click to set up your radio
                        stream
                      </span>
                    )}
                    <span
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "11px",
                        fontWeight: "500",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      EDIT
                    </span>
                  </div>
                </div>
              )}
            </section>
          </header>

          <section>
            {/* Tab Navigation */}
            <div
              style={{
                borderBottom: "1px solid #ddd",
                marginBottom: "1rem",
                position: "sticky",
                top: "0",
                backgroundColor: "white",
                zIndex: 10,
                paddingBottom: "0",
              }}
            >
              <div style={{ display: "flex", gap: "0", flexWrap: "wrap" }}>
                <button
                  onClick={() => setActiveTab("podcasts")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor:
                      activeTab === "podcasts" ? "#007bff" : "transparent",
                    color: activeTab === "podcasts" ? "white" : "#666",
                    border: "1px solid #ddd",
                    borderBottom:
                      activeTab === "podcasts" ? "none" : "1px solid #ddd",
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "0",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: activeTab === "podcasts" ? "bold" : "normal",
                  }}
                >
                  Podcast Episodes ({podcasts.length})
                </button>
                <button
                  onClick={() => setActiveTab("programmes")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor:
                      activeTab === "programmes" ? "#007bff" : "transparent",
                    color: activeTab === "programmes" ? "white" : "#666",
                    border: "1px solid #ddd",
                    borderBottom:
                      activeTab === "programmes" ? "none" : "1px solid #ddd",
                    borderLeft: "none",
                    borderTopLeftRadius: "0",
                    borderTopRightRadius: "0",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: activeTab === "programmes" ? "bold" : "normal",
                  }}
                >
                  Programme Schedule ({programmes.length})
                </button>
                <button
                  onClick={() => setActiveTab("shows")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor:
                      activeTab === "shows" ? "#007bff" : "transparent",
                    color: activeTab === "shows" ? "white" : "#666",
                    border: "1px solid #ddd",
                    borderBottom:
                      activeTab === "shows" ? "none" : "1px solid #ddd",
                    borderLeft: "none",
                    borderTopLeftRadius: "0",
                    borderTopRightRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: activeTab === "shows" ? "bold" : "normal",
                  }}
                >
                  Shows ({shows.length})
                </button>
              </div>
            </div>

            {/* Tab Content Container */}
            <div
              style={{
                width: "100%",
                minHeight: "500px",
                maxWidth: "100%",
              }}
            >
              {/* Tab Content */}
              {activeTab === "podcasts" && (
                <PodcastTable
                  podcasts={podcasts}
                  setPodcasts={setPodcasts}
                  availableShows={availableShows}
                  setAvailableShows={setAvailableShows}
                />
              )}

              {activeTab === "programmes" && (
                <ProgrammeTable
                  programmes={programmes}
                  setProgrammes={setProgrammes}
                  availableDays={availableDays}
                  setAvailableDays={setAvailableDays}
                />
              )}

              {activeTab === "shows" && (
                <ShowsTable shows={shows} setShows={setShows} />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
