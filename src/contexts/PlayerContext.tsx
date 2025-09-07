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

  return (
    <PlayerContext.Provider
      value={{
        currentContent,
        isPlayerVisible,
        setCurrentContent,
        setPlayerVisible,
        clearPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
