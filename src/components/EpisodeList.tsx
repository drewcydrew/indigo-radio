import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  const [isShowDetailsDisabled, setIsShowDetailsDisabled] = useState(false);

  // Use the hook to get show details
  const { findShowByName } = useShowDetails();

  // Update selectedShows when initialFilter changes
  useEffect(() => {
    if (initialFilter) {
      setSelectedShows([initialFilter]);
    } else {
      setSelectedShows([]);
    }
  }, [initialFilter]);

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
      Platform.OS === "ios" ? 600 : 200
    );
  }, []);

  // Pass the closing state to the episode display
  const handleEpisodeShowDetails = useCallback(
    (showName: string) => {
      if (onShowDetails && !isEpisodeModalClosing && !isShowDetailsDisabled) {
        // Disable further calls temporarily
        setIsShowDetailsDisabled(true);

        onShowDetails(showName);

        // Re-enable after a delay
        setTimeout(
          () => {
            setIsShowDetailsDisabled(false);
          },
          Platform.OS === "ios" ? 1000 : 500
        );
      }
    },
    [onShowDetails, isEpisodeModalClosing, isShowDetailsDisabled]
  );

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
      {selectedEpisode && showModal && !isEpisodeModalClosing && (
        <PodcastEpisodeDisplay
          episode={selectedEpisode}
          visible={showModal}
          onClose={handleCloseModal}
          onPlay={onEpisodePress}
          onShowDetails={handleEpisodeShowDetails}
        />
      )}
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
    padding: 20,
    backgroundColor: "#008080",
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: "#FFFBE7",
    marginHorizontal: Platform.OS === "web" ? 0 : 0,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  artworkContainer: {
    marginRight: 16,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  placeholderArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#FFFBE7",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 10,
    fontWeight: "700",
    color: "#008080",
    letterSpacing: 0.5,
  },
  episodeInfo: {
    flex: 1,
    marginRight: 16,
    minWidth: 0, // Important for text truncation on web
  },
  showName: {
    fontWeight: "700",
    color: "#FFFBE7",
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },
  episodeTitle: {
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 6,
    color: "#FFFBE7",
    letterSpacing: 0.3,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  artistName: {
    fontSize: 14,
    color: "#e2e8f0",
    marginBottom: 6,
    fontWeight: "500",
  },
  duration: {
    color: "#FFFBE7",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  description: {
    color: "#e2e8f0",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontStyle: "italic",
    opacity: 0.8,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  noEpisodes: {
    textAlign: "center",
    color: "#FFFBE7",
    marginTop: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    paddingHorizontal: 16,
    color: "#FFFBE7",
    letterSpacing: 0.5,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DD8210",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#DD8210",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonText: {
    color: "#FFFBE7",
    fontSize: 18,
    fontWeight: "600",
  },
});
