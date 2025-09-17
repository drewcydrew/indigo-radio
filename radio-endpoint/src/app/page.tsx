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
          <h2>Podcast Episodes</h2>
          {podcasts.length === 0 ? (
            <p>No podcast episodes available.</p>
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
                      }}
                    >
                      ID
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        border: "1px solid #ddd",
                      }}
                    >
                      Show
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        border: "1px solid #ddd",
                      }}
                    >
                      Title
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        border: "1px solid #ddd",
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        border: "1px solid #ddd",
                      }}
                    >
                      Audio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {podcasts.map((episode) => (
                    <tr key={episode.id}>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {episode.id}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {episode.show}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {episode.title}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {episode.description}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <audio controls style={{ width: "200px" }}>
                          <source src={episode.url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
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
