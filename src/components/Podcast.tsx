import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { audioService } from "../services/AudioService";
import EpisodeList from "./EpisodeList";
import { PodcastEpisode } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";
import usePodcastEpisodes from "../hooks/usePodcastEpisodes";
import { usePlayer } from "../contexts/PlayerContext";
import UniversalPlayer from "./UniversalPlayer";

interface PodcastProps {
  onNowPlayingUpdate: (title: string) => void;
  initialFilter?: string;
}

export default function Podcast({
  onNowPlayingUpdate,
  initialFilter,
}: PodcastProps) {
  const { setCurrentContent, setPlayerVisible } = usePlayer();
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
        // Check if we're on web and warn about potential CORS issues
        if (Platform.OS === "web") {
          console.warn(
            "Playing podcasts on web may be limited due to CORS policies"
          );
        }

        // Get show definition for artwork
        const showDef = showDefinitions.find(
          (show) => show.name === episode.show
        );
        const artwork = showDef?.artwork;

        // Reset the player and add the new episode
        await audioService.reset();

        // Update player context first
        setCurrentContent({ type: "podcast", episode });
        setPlayerVisible(true);

        if (Platform.OS !== "web") {
          await audioService.add({
            id: episode.id,
            url: episode.url,
            title: episode.title,
            artist: episode.show,
            artwork: artwork,
          });
        } else {
          // For web, the UniversalPlayer will handle the audio URL change
          await audioService.add({
            id: episode.id,
            url: episode.url,
            title: episode.title,
            artist: episode.show,
            artwork: artwork,
          });
        }

        // Start playing
        await audioService.play();

        // Update app state
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
        style={[styles.content, Platform.OS === "web" && styles.webContent]}
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

      {/* Universal Player */}
      <UniversalPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //minHeight: Platform.OS === "web" ? "100vh" : "auto",
  },
  webContainer: {
    maxWidth: "100%",
    width: "100%",
    alignSelf: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: 0, // Allow content to shrink
  },
  webContent: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  episodeListContainer: {
    flex: 1,
    minHeight: 0, // Important for proper scrolling
  },
  webEpisodeListContainer: {
    width: "100%",
    maxWidth: "100%",
  },
});
