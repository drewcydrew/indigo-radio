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
  const [selectedShow, setSelectedShow] = useState<string | null>(
    initialFilter || null
  );

  // Use the hook to get show details
  const { findShowByName } = useShowDetails();

  // Get unique shows for filtering
  const shows = [...new Set(episodes.map((episode) => episode.show))];

  // Filter episodes by selected show
  const filteredEpisodes = selectedShow
    ? episodes.filter((episode) => episode.show === selectedShow)
    : episodes;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderFilterButton = ({ item: show }: { item: string | null }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedShow === show ? styles.activeFilter : styles.inactiveFilter,
      ]}
      onPress={() => setSelectedShow(show)}
    >
      <Text
        style={[
          styles.filterText,
          selectedShow === show
            ? styles.activeFilterText
            : styles.inactiveFilterText,
        ]}
      >
        {show || "ALL SHOWS"}
      </Text>
    </TouchableOpacity>
  );

  // Function to find show definition by show name
  const findShowDefinition = (showName: string): ShowDefinition | null => {
    return findShowByName(showName);
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
        onPress={() => onEpisodePress(episode.id)}
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
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {showTitle && <Text style={styles.title}>Podcast Episodes</Text>}
      <FlatList
        data={filterData}
        renderItem={renderFilterButton}
        keyExtractor={(item) => item || "all"}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      />
    </View>
  );

  const filterData = [null, ...shows];

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
            No episodes found{selectedShow ? ` for "${selectedShow}"` : ""}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterScrollView: {
    marginBottom: 16,
    flexGrow: 0,
  },
  filterContainer: {
    gap: 8,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  activeFilter: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  inactiveFilter: {
    backgroundColor: "transparent",
    borderColor: "#ccc",
  },
  filterText: {
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  activeFilterText: {
    color: "#fff",
  },
  inactiveFilterText: {
    color: "#666",
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
});
