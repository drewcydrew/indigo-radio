import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { PodcastEpisode } from "../types/types";

interface EpisodeListProps {
  episodes: PodcastEpisode[];
  onEpisodePress: (episodeId: string) => void;
  currentTrackDuration?: number;
  showTitle?: boolean;
}

export default function EpisodeList({
  episodes,
  onEpisodePress,
  currentTrackDuration,
  showTitle = false,
}: EpisodeListProps) {
  const [selectedShow, setSelectedShow] = useState<string | null>(null);

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
          { color: selectedShow === show ? "white" : "#666" },
        ]}
      >
        {show || "All Shows"}
      </Text>
    </TouchableOpacity>
  );

  const renderEpisode = ({ item: episode }: { item: PodcastEpisode }) => (
    <TouchableOpacity
      style={styles.episodeItem}
      onPress={() => onEpisodePress(episode.id)}
    >
      {/* Artwork */}
      <View style={styles.artworkContainer}>
        {episode.artwork ? (
          <Image
            source={{ uri: episode.artwork }}
            style={styles.artwork}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderArtwork}>
            <Text style={styles.placeholderIcon}>🎧</Text>
          </View>
        )}
      </View>

      {/* Episode Info */}
      <View style={styles.episodeInfo}>
        <Text style={styles.showName}>{episode.show}</Text>
        <Text style={styles.episodeTitle}>{episode.title}</Text>
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
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: "#007AFF",
  },
  inactiveFilter: {
    backgroundColor: "#f0f0f0",
  },
  filterText: {
    fontWeight: "600",
    fontSize: 12,
  },
  episodeItem: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  placeholderArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 24,
  },
  episodeInfo: {
    flex: 1,
  },
  showName: {
    fontWeight: "600",
    color: "#007AFF",
    fontSize: 12,
    marginBottom: 2,
  },
  episodeTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  duration: {
    opacity: 0.7,
    fontSize: 12,
    marginBottom: 4,
  },
  description: {
    opacity: 0.6,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  noEpisodes: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});
