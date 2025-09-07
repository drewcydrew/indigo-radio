import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Platform } from "react-native";

export interface AudioState {
  position: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
}

interface WebAudioPlayerProps {
  src?: string;
  onStateChange: (state: AudioState) => void;
  onLoad?: () => void;
  onError?: (error: string) => void;
  autoPlay?: boolean;
}

export interface WebAudioPlayerRef {
  play: () => Promise<void>;
  pause: () => void;
  seekTo: (position: number) => void;
  setVolume: (volume: number) => void;
}

const WebAudioPlayer = forwardRef<WebAudioPlayerRef, WebAudioPlayerProps>(
  ({ src, onStateChange, onLoad, onError, autoPlay = false }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldPlay, setShouldPlay] = useState(autoPlay);
    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: async () => {
          const audio = audioRef.current;
          if (!audio) return;

          setShouldPlay(true);
          try {
            // If audio is ready, play immediately
            if (audio.readyState >= 3) {
              await audio.play();
            }
            // Otherwise, it will play when canplay event fires
          } catch (error) {
            console.error("Error playing audio:", error);
            onError?.("Failed to play audio");
          }
        },
        pause: () => {
          const audio = audioRef.current;
          if (!audio) return;

          setShouldPlay(false);
          audio.pause();
        },
        seekTo: (position: number) => {
          const audio = audioRef.current;
          if (audio && !isNaN(audio.duration) && audio.duration > 0) {
            audio.currentTime = position;
          }
        },
        setVolume: (volume: number) => {
          const audio = audioRef.current;
          if (audio) {
            audio.volume = Math.max(0, Math.min(1, volume));
          }
        },
      }),
      [onError, isLoading]
    );

    useEffect(() => {
      if (Platform.OS !== "web") return;

      const audio = audioRef.current;
      if (!audio) return;

      const updateState = () => {
        onStateChange({
          position: isNaN(audio.currentTime) ? 0 : audio.currentTime,
          duration: isNaN(audio.duration) ? 0 : audio.duration,
          isPlaying: !audio.paused && !audio.ended,
          isLoading: audio.readyState < 3,
        });
      };

      const handleLoadStart = () => {
        setIsLoading(true);
        updateState();
      };

      const handleCanPlay = async () => {
        setIsLoading(false);
        updateState();
        onLoad?.();

        // Auto-play if requested and we're not already playing
        if (shouldPlay && audio.paused) {
          try {
            await audio.play();
          } catch (error) {
            console.error("Auto-play failed:", error);
            onError?.("Auto-play failed - user interaction may be required");
          }
        }
      };

      const handleTimeUpdate = () => {
        updateState();
      };

      const handlePlay = () => {
        setIsPlaying(true);
        updateState();
      };

      const handlePause = () => {
        setIsPlaying(false);
        updateState();
      };

      const handleError = (e: Event) => {
        const audio = audioRef.current;
        const error = audio?.error;

        let errorMessage = "Failed to load audio";
        if (error) {
          switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
              errorMessage = "Audio loading was aborted";
              break;
            case error.MEDIA_ERR_NETWORK:
              errorMessage = "Network error occurred while loading audio";
              break;
            case error.MEDIA_ERR_DECODE:
              errorMessage =
                "Audio file is corrupted or in an unsupported format";
              break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage =
                "Audio format not supported or CORS policy blocked the request";
              break;
            default:
              errorMessage = "Unknown audio error occurred";
          }
        }

        console.error("Audio error:", errorMessage, e);
        setIsLoading(false);
        onError?.(errorMessage);
        updateState();
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setShouldPlay(false);
        updateState();
      };

      const handleWaiting = () => {
        setIsLoading(true);
        updateState();
      };

      const handleCanPlayThrough = () => {
        setIsLoading(false);
        updateState();
      };

      // Add all event listeners
      audio.addEventListener("loadstart", handleLoadStart);
      audio.addEventListener("canplay", handleCanPlay);
      audio.addEventListener("canplaythrough", handleCanPlayThrough);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("error", handleError);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("waiting", handleWaiting);

      return () => {
        audio.removeEventListener("loadstart", handleLoadStart);
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("canplaythrough", handleCanPlayThrough);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("error", handleError);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("waiting", handleWaiting);
      };
    }, [src, onStateChange, onLoad, onError, shouldPlay]);

    // Handle source changes
    useEffect(() => {
      if (Platform.OS !== "web") return;

      const audio = audioRef.current;
      if (!audio || !src || src === currentSrc) return;

      console.log("Changing audio source from", currentSrc, "to", src);

      // Remember if we were playing
      const wasPlaying = shouldPlay || !audio.paused;

      // Update source
      audio.src = src;
      setCurrentSrc(src);

      // Load the new source
      audio.load();

      // Maintain playback state for new source
      if (wasPlaying) {
        setShouldPlay(true);
      }
    }, [src, currentSrc, shouldPlay]);

    if (Platform.OS !== "web") {
      return null;
    }

    return (
      <audio ref={audioRef} style={{ display: "none" }} preload="metadata" />
    );
  }
);

export default WebAudioPlayer;

// Export methods for controlling the audio
export const webAudioControls = {
  play: () => {
    if (Platform.OS === "web") {
      const audio = document.querySelector("audio") as HTMLAudioElement;
      return audio?.play();
    }
  },
  pause: () => {
    if (Platform.OS === "web") {
      const audio = document.querySelector("audio") as HTMLAudioElement;
      audio?.pause();
    }
  },
  seekTo: (position: number) => {
    if (Platform.OS === "web") {
      const audio = document.querySelector("audio") as HTMLAudioElement;
      if (audio) {
        audio.currentTime = position;
      }
    }
  },
  setVolume: (volume: number) => {
    if (Platform.OS === "web") {
      const audio = document.querySelector("audio") as HTMLAudioElement;
      if (audio) {
        audio.volume = Math.max(0, Math.min(1, volume));
      }
    }
  },
};
