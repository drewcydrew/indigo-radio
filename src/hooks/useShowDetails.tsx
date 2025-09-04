import { useState, useEffect } from "react";
import { ShowDefinition } from "../types/types";

const API_URL =
  "https://radio-endpoint-byixzlym5-drewcydrews-projects.vercel.app/api/shows";

export default function useShowDetails() {
  const [showDefinitions, setShowDefinitions] = useState<ShowDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch show definitions from the backend
  useEffect(() => {
    const fetchShowDefinitions = async () => {
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

        const data: ShowDefinition[] = await response.json();
        setShowDefinitions(data);
        setError(null);
      } catch (err) {
        setError("Failed to load show details");
        setShowDefinitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShowDefinitions();
  }, []);

  // Find a show by its name
  const findShowByName = (name: string): ShowDefinition | null => {
    if (showDefinitions.length === 0) {
      return null;
    }

    const found =
      showDefinitions.find(
        (show) =>
          show.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(show.name.toLowerCase()) ||
          show.showId
            .toLowerCase()
            .includes(name.toLowerCase().replace(/\s+/g, "-"))
      ) || null;

    return found;
  };

  // Find a show by its ID
  const findShowById = (id: string): ShowDefinition | null => {
    const found = showDefinitions.find((show) => show.showId === id) || null;
    return found;
  };

  return {
    showDefinitions,
    loading,
    error,
    findShowByName,
    findShowById,
    hasApiData: showDefinitions.length > 0,
  };
}
