import React, { createContext, useContext, useState, ReactNode } from "react";
import { PodcastEpisode, RadioProgram } from "../types/types";

export type PlayerContent =
  | { type: "podcast"; episode: PodcastEpisode }
  | { type: "live"; program?: RadioProgram | null };

interface PlayerContextType {
  currentContent: PlayerContent | null;
  isPlayerVisible: boolean;
  setCurrentContent: (content: PlayerContent | null) => void;
  setPlayerVisible: (visible: boolean) => void;
  clearPlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentContent, setCurrentContent] = useState<PlayerContent | null>(
    null
  );
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const setPlayerVisible = (visible: boolean) => {
    setIsPlayerVisible(visible);
  };

  const clearPlayer = () => {
    setCurrentContent(null);
    setIsPlayerVisible(false);
  };

  // Helper function to compare content
  const isContentSame = (
    content1: PlayerContent | null,
    content2: PlayerContent | null
  ): boolean => {
    if (!content1 && !content2) return true;
    if (!content1 || !content2) return false;

    if (content1.type !== content2.type) return false;

    if (content1.type === "podcast" && content2.type === "podcast") {
      return content1.episode.id === content2.episode.id;
    }

    if (content1.type === "live" && content2.type === "live") {
      // For live radio, consider it the same if both are live (regardless of program)
      // since the stream URL is always the same
      return true;
    }

    return false;
  };

  // Enhanced setCurrentContent that avoids unnecessary reloads
  const handleSetCurrentContent = (content: PlayerContent | null) => {
    // Only update if the content is actually different
    if (!isContentSame(currentContent, content)) {
      setCurrentContent(content);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentContent,
        isPlayerVisible,
        setCurrentContent: handleSetCurrentContent,
        setPlayerVisible,
        clearPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
