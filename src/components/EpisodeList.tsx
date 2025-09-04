import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import { PodcastEpisode } from "../types/types";

interface EpisodeListProps {
  episodes: PodcastEpisode[];
  onEpisodePress: (episodeId: string) => void;
  currentTrackDuration?: number; // Optional: current playing track duration
}

export default function EpisodeList({
  episodes,
  onEpisodePress,
  currentTrackDuration,
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

  // Web filter button component
  const WebFilterButton = ({
    show,
    isActive,
    onPress,
  }: {
    show: string | null;
    isActive: boolean;
    onPress: () => void;
  }) => {
    if (Platform.OS !== "web") return null;

    return (
      <TouchableOpacity
        style={[
          styles.webFilterButton,
          isActive ? styles.webActiveFilter : styles.webInactiveFilter,
        ]}
        onPress={onPress}
      >
        <Text
          style={[styles.webFilterText, { color: isActive ? "white" : "#666" }]}
        >
          {show || "All Shows"}
        </Text>
      </TouchableOpacity>
    );
  };

  // Web episode item component
  const WebEpisodeItem = ({ episode }: { episode: PodcastEpisode }) => {
    if (Platform.OS !== "web") return null;

    return (
      <TouchableOpacity
        style={styles.webEpisodeItem}
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
  };

  // Web implementation
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        {/* Show Filter Buttons */}
        <View style={styles.webFilterContainer}>
          <WebFilterButton
            show={null}
            isActive={selectedShow === null}
            onPress={() => setSelectedShow(null)}
          />
          {shows.map((show) => (
            <WebFilterButton
              key={show}
              show={show}
              isActive={selectedShow === show}
              onPress={() => setSelectedShow(show)}
            />
          ))}
        </View>

        {/* Episodes List */}
        {filteredEpisodes.map((episode) => (
          <WebEpisodeItem key={episode.id} episode={episode} />
        ))}

        {filteredEpisodes.length === 0 && (
          <Text style={styles.noEpisodes}>
            No episodes found for "{selectedShow}"
          </Text>
        )}
      </View>
    );
  }

  // Mobile implementation
  return (
    <View style={styles.container}>
      {/* Show Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedShow === null ? styles.activeFilter : styles.inactiveFilter,
          ]}
          onPress={() => setSelectedShow(null)}
        >
          <Text
            style={[
              styles.filterText,
              { color: selectedShow === null ? "white" : "#666" },
            ]}
          >
            All Shows
          </Text>
        </TouchableOpacity>

        {shows.map((show) => (
          <TouchableOpacity
            key={show}
            style={[
              styles.filterButton,
              selectedShow === show
                ? styles.activeFilter
                : styles.inactiveFilter,
            ]}
            onPress={() => setSelectedShow(show)}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedShow === show ? "white" : "#666" },
              ]}
            >
              {show}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Episodes List */}
      {filteredEpisodes.map((episode) => (
        <TouchableOpacity
          key={episode.id}
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
      ))}

      {filteredEpisodes.length === 0 && (
        <Text style={styles.noEpisodes}>
          No episodes found for "{selectedShow}"
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  filterScrollView: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
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
  webFilterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  webFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  webActiveFilter: {
    backgroundColor: "#007AFF",
  },
  webInactiveFilter: {
    backgroundColor: "#f0f0f0",
  },
  webFilterText: {
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
  webEpisodeItem: {
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
});
