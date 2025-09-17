import { useState, useEffect } from "react";

const API_URL =
  "https://radio-endpoint-git-endpoint-drewcydrews-projects.vercel.app/api/shows/radioaddress";

// Fallback URL in case the API fails
const FALLBACK_URL = "https://internetradio.indigofm.au:8174/stream";

interface RadioAddressResponse {
  radioAddress: string;
}

export default function useRadioAddress() {
  const [radioAddress, setRadioAddress] = useState<string>(FALLBACK_URL);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRadioAddress = async () => {
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

      const data: RadioAddressResponse = await response.json();

      if (data.radioAddress) {
        setRadioAddress(data.radioAddress);
      } else {
        throw new Error("Invalid response: missing radioAddress");
      }

      setError(null);
    } catch (err) {
      console.warn("Failed to fetch radio address, using fallback:", err);
      setError("Failed to load radio address, using default");
      setRadioAddress(FALLBACK_URL);
    } finally {
      setLoading(false);
    }
  };

  // Fetch radio address on mount
  useEffect(() => {
    fetchRadioAddress();
  }, []);

  // Function to manually refresh the radio address
  const refreshRadioAddress = () => {
    fetchRadioAddress();
  };

  // Function to manually update the radio address (for the update modal)
  const updateRadioAddress = (newAddress: string) => {
    setRadioAddress(newAddress);
    setError(null);
  };

  return {
    radioAddress,
    loading,
    error,
    refreshRadioAddress,
    updateRadioAddress,
    isUsingFallback: radioAddress === FALLBACK_URL,
  };
}
