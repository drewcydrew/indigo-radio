import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
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
      try {
        // Reset the player and add the new episode
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: episode.id,
          url: episode.url,
          title: episode.title,
          artist: episode.show,
          artwork: undefined, // Add artwork URL if available in your episode data
        });

        // Start playing
        await TrackPlayer.play();

        // Update state
        setCurrentEpisode(episode);
        onNowPlayingUpdate(episode.title);
      } catch (error) {
        console.error("Error playing episode:", error);
      }
    }
  };

  return (
    <View
      style={[styles.container, Platform.OS === "web" && styles.webContainer]}
    >
      {/* Podcast Content */}
      <View
        style={[
          styles.content,
          Platform.OS === "web" && styles.webContent,
          { paddingBottom: currentEpisode ? 120 : 0 },
        ]}
      >
        {/* Episodes List Component */}
        <View
          style={[
            styles.episodeListContainer,
            Platform.OS === "web" && styles.webEpisodeListContainer,
          ]}
        >
          <EpisodeList
            episodes={episodes}
            onEpisodePress={playEpisode}
            currentTrackDuration={0}
            showTitle={true}
            initialFilter={initialFilter}
          />
        </View>
      </View>

      {/* Playing Window Component - Only show if episode is selected */}
      {currentEpisode && <PlayingWindow currentEpisode={currentEpisode} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    maxWidth: "100%",
    width: "100%",
    alignSelf: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  webContent: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  episodeListContainer: {
    flex: 1,
  },
  webEpisodeListContainer: {
    width: "100%",
    maxWidth: "100%",
  },
});
