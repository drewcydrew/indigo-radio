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
          {/* Tab Navigation */}
          <div style={{ borderBottom: "1px solid #ddd", marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: "0" }}>
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
        </section>
      </main>
    </div>
  );
}
