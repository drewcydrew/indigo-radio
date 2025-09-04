import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import TrackPlayer, { useProgress } from "react-native-track-player";
import EpisodeList from "./EpisodeList";
import PlayingWindow from "./PlayingWindow";
import { PodcastEpisode } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";
import usePodcastEpisodes from "../hooks/usePodcastEpisodes";

interface PodcastProps {
  onNowPlayingUpdate: (title: string) => void;
  initialFilter?: string;
}

export default function Podcast({
  onNowPlayingUpdate,
  initialFilter,
}: PodcastProps) {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(
    null
  );

  // Use the hooks to get show details and podcast episodes
  const { showDefinitions } = useShowDetails();
  const { episodes } = usePodcastEpisodes();

  const playEpisode = async (episodeId: string) => {
    const episode = episodes.find((ep) => ep.id === episodeId);
    if (episode) {
      setCurrentEpisode(episode);
      onNowPlayingUpdate(episode.title);
      // Additional platform-specific logic can be added here if needed
    }
  };

  return (
    <View style={styles.container}>
      {/* Podcast Content */}
      <View style={styles.content}>
        {/* Episodes List Component */}
        <EpisodeList
          episodes={episodes}
          onEpisodePress={playEpisode}
          currentTrackDuration={0}
          showTitle={true}
          initialFilter={initialFilter}
        />
      </View>

      {/* Playing Window Component - Fixed at Bottom */}
      <PlayingWindow currentEpisode={currentEpisode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 120, // Space for player at bottom
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
