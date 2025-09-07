import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { PodcastEpisode, ShowDefinition } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";
import ShowFilterDropdown from "./ShowFilterDropdown";
import PodcastEpisodeDisplay from "./PodcastEpisodeDisplay";
import TextSearch from "./TextSearch";

interface EpisodeListProps {
  episodes: PodcastEpisode[];
  onEpisodePress: (episodeId: string) => void;
  currentTrackDuration?: number;
  showTitle?: boolean;
  initialFilter?: string;
  onGoToShow?: (showName: string) => void;
  onShowDetails?: (showName: string) => void;
}

export default function EpisodeList({
  episodes,
  onEpisodePress,
  currentTrackDuration,
  showTitle = false,
  initialFilter,
  onGoToShow,
  onShowDetails,
}: EpisodeListProps) {
  const [selectedShows, setSelectedShows] = useState<string[]>(
    initialFilter ? [initialFilter] : []
  );
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isEpisodeModalClosing, setIsEpisodeModalClosing] = useState(false);

  // Use the hook to get show details
  const { findShowByName } = useShowDetails();

  // Get unique shows for filtering - memoize to prevent unnecessary recalculations
  const shows = useMemo(
    () => [...new Set(episodes.map((episode) => episode.show))],
    [episodes]
  );

  // Filter episodes by selected shows and search query - memoize the filtering logic
  const filteredEpisodes = useMemo(() => {
    return episodes.filter((episode) => {
      // Show filter
      const showMatch =
        selectedShows.length === 0 || selectedShows.includes(episode.show);

      // Text search filter - only apply if there's an actual search query
      const searchMatch =
        searchQuery.length === 0 ||
        episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (episode.description &&
          episode.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      return showMatch && searchMatch;
    });
  }, [episodes, selectedShows, searchQuery]);

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

  const handleShowsChange = useCallback((showNames: string[]) => {
    setSelectedShows(showNames);
  }, []);

  const handleClearFilter = useCallback(() => {
    setSelectedShows([]);
  }, []);

  const handleEpisodePress = useCallback((episode: PodcastEpisode) => {
    setSelectedEpisode(episode);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsEpisodeModalClosing(true);
    setShowModal(false);

    // Reset closing state after animation completes
    setTimeout(
      () => {
        setSelectedEpisode(null);
        setIsEpisodeModalClosing(false);
      },
      Platform.OS === "ios" ? 400 : 200
    );
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const renderEpisode = useCallback(
    ({ item: episode }: { item: PodcastEpisode }) => {
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
    },
    [
      handleEpisodePress,
      onEpisodePress,
      currentTrackDuration,
      findShowDefinition,
    ]
  );

  const renderHeader = useCallback(
    () => (
      <View key="episode-list-header">
        {showTitle && <Text style={styles.title}>Podcast Episodes</Text>}

        {/* Text Search */}
        <TextSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          placeholder="Type and press enter to search..."
        />

        {/* Show Filter Dropdown */}
        <ShowFilterDropdown
          shows={shows}
          selectedShows={selectedShows}
          onShowsChange={handleShowsChange}
          onClearFilter={handleClearFilter}
        />
      </View>
    ),
    [
      showTitle,
      searchQuery,
      handleSearchChange,
      handleClearSearch,
      shows,
      selectedShows,
      handleShowsChange,
      handleClearFilter,
    ]
  );

  const listEmptyComponent = useCallback(
    () => (
      <Text style={styles.noEpisodes}>
        No episodes found
        {selectedShows.length > 0 || searchQuery.length > 0
          ? ` matching your search criteria`
          : ""}
      </Text>
    ),
    [selectedShows.length, searchQuery.length]
  );

  // Pass the closing state to the episode display
  const handleEpisodeShowDetails = useCallback(
    (showName: string) => {
      if (onShowDetails && !isEpisodeModalClosing) {
        onShowDetails(showName);
      }
    },
    [onShowDetails, isEpisodeModalClosing]
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
        ListEmptyComponent={listEmptyComponent}
        keyboardShouldPersistTaps="handled"
      />

      {/* Episode Display Modal */}
      <PodcastEpisodeDisplay
        episode={selectedEpisode}
        visible={showModal}
        onClose={handleCloseModal}
        onPlay={onEpisodePress}
        onShowDetails={handleEpisodeShowDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
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
    marginHorizontal: Platform.OS === "web" ? 0 : 16,
    maxWidth: "100%",
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
    minWidth: 0, // Important for text truncation on web
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
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
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
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
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
