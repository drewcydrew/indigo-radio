import { useState, useEffect } from "react";
import { PodcastEpisode } from "../types/types";

const API_URL =
  "https://radio-endpoint-d8p5mc3jh-drewcydrews-projects.vercel.app/api/shows/podcasts";

export default function usePodcastEpisodes() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch podcast episodes from the backend
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: PodcastEpisode[] = await response.json();
        setEpisodes(data);
        setError(null);
      } catch (err) {
        setError("Failed to load podcast episodes");
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  // Get episodes for a specific show
  const getEpisodesForShow = (showName: string): PodcastEpisode[] => {
    return episodes.filter(
      (episode) => episode.show.toLowerCase() === showName.toLowerCase()
    );
  };

  // Get unique show names
  const getUniqueShows = (): string[] => {
    return [...new Set(episodes.map((episode) => episode.show))];
  };

  // Find episode by ID
  const findEpisodeById = (id: string): PodcastEpisode | null => {
    return episodes.find((episode) => episode.id === id) || null;
  };

  // Search episodes by title or description
  const searchEpisodes = (query: string): PodcastEpisode[] => {
    const searchTerm = query.toLowerCase();
    return episodes.filter(
      (episode) =>
        episode.title.toLowerCase().includes(searchTerm) ||
        episode.description?.toLowerCase().includes(searchTerm) ||
        episode.show.toLowerCase().includes(searchTerm)
    );
  };

  return {
    episodes,
    loading,
    error,
    getEpisodesForShow,
    getUniqueShows,
    findEpisodeById,
    searchEpisodes,
    hasData: episodes.length > 0,
  };
}
