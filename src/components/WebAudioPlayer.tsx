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

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: async () => {
          const audio = audioRef.current;
          if (!audio) return;

          setShouldPlay(true);
          try {
            await audio.play();
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
          if (audio) {
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
      [onError]
    );

    useEffect(() => {
      if (Platform.OS !== "web") return;

      const audio = audioRef.current;
      if (!audio) return;

      const updateState = () => {
        onStateChange({
          position: audio.currentTime,
          duration: audio.duration || 0,
          isPlaying: !audio.paused,
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

        // Auto-play if requested
        if (shouldPlay) {
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

      const handleError = () => {
        setIsLoading(false);
        onError?.("Failed to load audio");
        updateState();
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setShouldPlay(false);
        updateState();
      };

      audio.addEventListener("loadstart", handleLoadStart);
      audio.addEventListener("canplay", handleCanPlay);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("error", handleError);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("loadstart", handleLoadStart);
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("error", handleError);
        audio.removeEventListener("ended", handleEnded);
      };
    }, [src, onStateChange, onLoad, onError, shouldPlay]);

    useEffect(() => {
      if (Platform.OS !== "web") return;

      const audio = audioRef.current;
      if (!audio || !src) return;

      audio.src = src;
      audio.load();
    }, [src]);

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
