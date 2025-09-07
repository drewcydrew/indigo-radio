import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { PodcastEpisode, ShowDefinition } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";
import ShowFilterDropdown from "./ShowFilterDropdown";
import PodcastEpisodeDisplay from "./PodcastEpisodeDisplay";

interface EpisodeListProps {
  episodes: PodcastEpisode[];
  onEpisodePress: (episodeId: string) => void;
  currentTrackDuration?: number;
  showTitle?: boolean;
  initialFilter?: string;
}

export default function EpisodeList({
  episodes,
  onEpisodePress,
  currentTrackDuration,
  showTitle = false,
  initialFilter,
}: EpisodeListProps) {
  const [selectedShows, setSelectedShows] = useState<string[]>(
    initialFilter ? [initialFilter] : []
  );
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  // Use the hook to get show details
  const { findShowByName } = useShowDetails();

  // Get unique shows for filtering
  const shows = [...new Set(episodes.map((episode) => episode.show))];

  // Filter episodes by selected shows
  const filteredEpisodes =
    selectedShows.length === 0
      ? episodes
      : episodes.filter((episode) => selectedShows.includes(episode.show));

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Function to find show definition by show name
  const findShowDefinition = (showName: string): ShowDefinition | null => {
    return findShowByName(showName);
  };

  const handleShowsChange = (showNames: string[]) => {
    setSelectedShows(showNames);
  };

  const handleClearFilter = () => {
    setSelectedShows([]);
  };

  const handleEpisodePress = (episode: PodcastEpisode) => {
    setSelectedEpisode(episode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEpisode(null);
  };

  const renderEpisode = ({ item: episode }: { item: PodcastEpisode }) => {
    const showDef = findShowDefinition(episode.show);
    const artwork = showDef?.artwork;
    const artist =
      showDef?.host ||
      (showDef?.hosts ? showDef.hosts.join(", ") : "Indigo FM Podcast");

    return (
      <TouchableOpacity
        style={styles.episodeItem}
        onPress={() => handleEpisodePress(episode)}
      >
        {/* Artwork */}
        <View style={styles.artworkContainer}>
          {artwork ? (
            <Image
              source={{ uri: artwork }}
              style={styles.artwork}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderArtwork}>
              <Text style={styles.placeholderIcon}>PODCAST</Text>
            </View>
          )}
        </View>

        {/* Episode Info */}
        <View style={styles.episodeInfo}>
          <Text style={styles.showName}>{episode.show.toUpperCase()}</Text>
          <Text style={styles.episodeTitle}>{episode.title}</Text>
          <Text style={styles.artistName}>Hosted by {artist}</Text>
          <Text style={styles.duration}>
            Duration: {formatDuration(currentTrackDuration)}
          </Text>
          {episode.description && (
            <Text style={styles.description} numberOfLines={2}>
              {episode.description}
            </Text>
          )}
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => onEpisodePress(episode.id)}
        >
          <Text style={styles.playButtonText}>▶</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {showTitle && <Text style={styles.title}>Podcast Episodes</Text>}

      {/* Show Filter Dropdown */}
      <ShowFilterDropdown
        shows={shows}
        selectedShows={selectedShows}
        onShowsChange={handleShowsChange}
        onClearFilter={handleClearFilter}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Episodes List with Header */}
      <FlatList
        data={filteredEpisodes}
        renderItem={renderEpisode}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={styles.noEpisodes}>
            No episodes found
            {selectedShows.length > 0 ? ` for selected shows` : ""}
          </Text>
        }
      />

      {/* Episode Display Modal */}
      <PodcastEpisodeDisplay
        episode={selectedEpisode}
        visible={showModal}
        onClose={handleCloseModal}
        onPlay={onEpisodePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  episodeItem: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    marginBottom: 8,
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 3,
    borderLeftColor: "#000",
    marginHorizontal: 16,
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: "#e0e0e0",
  },
  placeholderArtwork: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 8,
    fontWeight: "700",
    color: "#666",
    letterSpacing: 0.5,
  },
  episodeInfo: {
    flex: 1,
    marginRight: 12,
  },
  showName: {
    fontWeight: "700",
    color: "#000",
    fontSize: 10,
    marginBottom: 4,
    letterSpacing: 1,
  },
  episodeTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
    color: "#000",
    letterSpacing: 0.3,
  },
  artistName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  duration: {
    color: "#888",
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  description: {
    color: "#666",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    fontStyle: "italic",
  },
  noEpisodes: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    paddingHorizontal: 16,
    color: "#000",
    letterSpacing: 0.5,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
