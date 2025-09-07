import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { audioService } from "../services/AudioService";
import EpisodeList from "./EpisodeList";
import { PodcastEpisode, ShowDefinition } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";
import usePodcastEpisodes from "../hooks/usePodcastEpisodes";
import { usePlayer } from "../contexts/PlayerContext";
import UniversalPlayer from "./UniversalPlayer";
import ShowDetailsModal from "./ShowDetailsModal";

interface PodcastProps {
  onNowPlayingUpdate: (title: string) => void;
  initialFilter?: string;
  onGoToShow?: (showName: string) => void;
}

export default function Podcast({
  onNowPlayingUpdate,
  initialFilter,
  onGoToShow,
}: PodcastProps) {
  const { setCurrentContent, setPlayerVisible } = usePlayer();
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [episodeFilter, setEpisodeFilter] = useState<string | undefined>(
    initialFilter
  );
  const [selectedShow, setSelectedShow] = useState<ShowDefinition | null>(null);
  const [pendingShowName, setPendingShowName] = useState<string | null>(null);

  // Use the hooks to get show details and podcast episodes
  const { showDefinitions, findShowByName } = useShowDetails();
  const { episodes } = usePodcastEpisodes();

  // Update filter when initialFilter changes
  useEffect(() => {
    setEpisodeFilter(initialFilter);
  }, [initialFilter]);

  const handleFilterEpisodes = (showName: string) => {
    setEpisodeFilter(showName);
  };

  const handleGoToShow = (showName: string) => {
    // When already in podcast mode, just filter episodes
    setEpisodeFilter(showName);
  };

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

  const handleShowDetailsPress = (showName: string) => {
    const showDef = findShowByName(showName);
    if (showDef) {
      // If there's already a modal open, queue this one
      if (selectedShow) {
        setPendingShowName(showName);
        return;
      }
      setSelectedShow(showDef);
    }
  };

  const hideShowDetails = () => {
    setSelectedShow(null);

    // Check if there's a pending show to display
    if (pendingShowName) {
      const showDef = findShowByName(pendingShowName);
      if (showDef) {
        // Use a longer delay for iOS to ensure proper modal transition
        setTimeout(
          () => {
            setSelectedShow(showDef);
            setPendingShowName(null);
          },
          Platform.OS === "ios" ? 600 : 300
        );
      } else {
        setPendingShowName(null);
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
            initialFilter={episodeFilter}
            onGoToShow={handleGoToShow}
            onShowDetails={handleShowDetailsPress}
          />
        </View>
      </View>

      {/* Universal Player */}
      <UniversalPlayer onShowDetails={handleShowDetailsPress} />

      {/* Show Details Modal */}
      {selectedShow && (
        <ShowDetailsModal
          show={selectedShow}
          onClose={hideShowDetails}
          onGoToShow={onGoToShow}
        />
      )}
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
