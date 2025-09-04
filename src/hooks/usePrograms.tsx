import { useState, useEffect } from "react";
import { RadioProgram } from "../types/types";

const API_URL =
  "https://radio-endpoint-g6iz0ufyp-drewcydrews-projects.vercel.app/api/shows/programme";

export default function usePrograms() {
  const [programs, setPrograms] = useState<RadioProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch radio programs from the backend
  useEffect(() => {
    const fetchPrograms = async () => {
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

        const data: RadioProgram[] = await response.json();
        setPrograms(data);
        setError(null);
      } catch (err) {
        setError("Failed to load radio programs");
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Get current program based on day and time
  const getCurrentProgram = (): RadioProgram | null => {
    if (programs.length === 0) return null;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format

    // Map JavaScript day names to our format
    const dayMapping: { [key: number]: RadioProgram["day"] } = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };

    const dayName = dayMapping[now.getDay()];

    // Find programs for today
    const todaysPrograms = programs.filter(
      (program) => program.day === dayName
    );

    // Find current program
    const currentProgram = todaysPrograms.find((program) => {
      const startTime = program.startTime;
      const endTime = program.endTime;

      // Handle programs that go past midnight
      if (endTime < startTime) {
        return currentTime >= startTime || currentTime <= endTime;
      }

      return currentTime >= startTime && currentTime <= endTime;
    });

    return currentProgram || null;
  };

  // Get programs for a specific day
  const getProgramsForDay = (day: RadioProgram["day"]): RadioProgram[] => {
    return programs
      .filter((program) => program.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Get today's programs
  const getTodaysPrograms = (): RadioProgram[] => {
    const dayMapping: { [key: number]: RadioProgram["day"] } = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };

    const todayName = dayMapping[new Date().getDay()];
    return getProgramsForDay(todayName);
  };

  return {
    programs,
    loading,
    error,
    getCurrentProgram,
    getProgramsForDay,
    getTodaysPrograms,
    hasData: programs.length > 0,
  };
}
