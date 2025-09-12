import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { audioService } from "../services/AudioService";
import EpisodeList from "./EpisodeList";
import { PodcastEpisode, ShowDefinition } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";
import usePodcastEpisodes from "../hooks/usePodcastEpisodes";
import { usePlayer } from "../contexts/PlayerContext";
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
  const [isModalClosing, setIsModalClosing] = useState(false);

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

        // Update player context first - UniversalPlayer will handle TrackPlayer setup
        setCurrentContent({ type: "podcast", episode });
        setPlayerVisible(true);

        // For web, set up the audio service track info
        if (Platform.OS === "web") {
          await audioService.add({
            id: episode.id,
            url: episode.url,
            title: episode.title,
            artist: episode.show,
            artwork: artwork,
          });
        }
        // Note: TrackPlayer setup now handled by UniversalPlayer

        // Update app state
        onNowPlayingUpdate(episode.title);
      } catch (error) {
        console.error("Error playing episode:", error);
      }
    }
  };

  const handleShowDetailsPress = (showName: string) => {
    // Prevent opening modal if one is already closing or open
    if (selectedShow || isModalClosing) {
      console.log("Modal already open or closing, ignoring request");
      return;
    }

    const showDef = findShowByName(showName);
    if (showDef) {
      console.log("Opening show details modal for:", showName);
      setSelectedShow(showDef);
    }
  };

  const hideShowDetails = () => {
    console.log("Closing show details modal");
    setIsModalClosing(true);
    setSelectedShow(null);

    // Reset the closing state after animation completes
    const delay = Platform.OS === "ios" ? 800 : 300;
    setTimeout(() => {
      setIsModalClosing(false);
    }, delay);
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

      {/* Show Details Modal - Only render when selectedShow exists and not closing */}
      {selectedShow && !isModalClosing && (
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
    backgroundColor: "#fff",
  },
  webContainer: {
    maxWidth: "100%",
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: 0, // Allow content to shrink
    backgroundColor: "#fff",
  },
  webContent: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  episodeListContainer: {
    flex: 1,
    minHeight: 0, // Important for proper scrolling
    backgroundColor: "#fff",
  },
  webEpisodeListContainer: {
    width: "100%",
    maxWidth: "100%",
    backgroundColor: "#fff",
  },
});
