import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
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

  // Web implementation
  if (Platform.OS === "web") {
    return (
      <div style={{ marginBottom: 20 }}>
        {/* Show Filter Buttons */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            overflowX: "auto",
          }}
        >
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: selectedShow === null ? "#007AFF" : "#f0f0f0",
              color: selectedShow === null ? "white" : "#666",
              border: "none",
              borderRadius: 20,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => setSelectedShow(null)}
          >
            All Shows
          </button>

          {shows.map((show) => (
            <button
              key={show}
              style={{
                padding: "8px 16px",
                backgroundColor: selectedShow === show ? "#007AFF" : "#f0f0f0",
                color: selectedShow === show ? "white" : "#666",
                border: "none",
                borderRadius: 20,
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() => setSelectedShow(show)}
            >
              {show}
            </button>
          ))}
        </div>

        {/* Episodes List */}
        {filteredEpisodes.map((episode) => (
          <div
            key={episode.id}
            style={{
              padding: 12,
              backgroundColor: "#f5f5f5",
              marginBottom: 8,
              borderRadius: 8,
              display: "flex",
              alignItems: "flex-start",
              cursor: "pointer",
            }}
            onClick={() => onEpisodePress(episode.id)}
          >
            {/* Artwork */}
            <div style={{ marginRight: 12 }}>
              {episode.artwork ? (
                <img
                  src={episode.artwork}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    backgroundColor: "#e0e0e0",
                    objectFit: "cover",
                  }}
                  alt={episode.title}
                />
              ) : (
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    backgroundColor: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  🎧
                </div>
              )}
            </div>

            {/* Episode Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "#007AFF",
                  fontSize: 12,
                  marginBottom: 2,
                }}
              >
                {episode.show}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {episode.title}
              </div>
              <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 4 }}>
                Duration: {formatDuration(currentTrackDuration)}
              </div>
              {episode.description && (
                <div
                  style={{
                    opacity: 0.6,
                    fontSize: 12,
                    lineHeight: "16px",
                    marginTop: 4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {episode.description}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredEpisodes.length === 0 && (
          <div style={{ textAlign: "center", opacity: 0.6, marginTop: 20 }}>
            No episodes found for "{selectedShow}"
          </div>
        )}
      </div>
    );
  }

  // Mobile implementation
  return (
    <View style={{ marginBottom: 20 }}>
      {/* Show Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: selectedShow === null ? "#007AFF" : "#f0f0f0",
            borderRadius: 20,
            marginRight: 8,
          }}
          onPress={() => setSelectedShow(null)}
        >
          <Text
            style={{
              color: selectedShow === null ? "white" : "#666",
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            All Shows
          </Text>
        </TouchableOpacity>

        {shows.map((show) => (
          <TouchableOpacity
            key={show}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: selectedShow === show ? "#007AFF" : "#f0f0f0",
              borderRadius: 20,
              marginRight: 8,
            }}
            onPress={() => setSelectedShow(show)}
          >
            <Text
              style={{
                color: selectedShow === show ? "white" : "#666",
                fontWeight: "600",
                fontSize: 12,
              }}
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
          style={{
            padding: 12,
            backgroundColor: "#f5f5f5",
            marginBottom: 8,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
          onPress={() => onEpisodePress(episode.id)}
        >
          {/* Artwork */}
          <View style={{ marginRight: 12 }}>
            {episode.artwork ? (
              <Image
                source={{ uri: episode.artwork }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: "#e0e0e0",
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: "#e0e0e0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>🎧</Text>
              </View>
            )}
          </View>

          {/* Episode Info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "600",
                color: "#007AFF",
                fontSize: 12,
                marginBottom: 2,
              }}
            >
              {episode.show}
            </Text>

            <Text style={{ fontWeight: "600", marginBottom: 4 }}>
              {episode.title}
            </Text>

            {/* Duration */}
            <Text style={{ opacity: 0.7, fontSize: 12, marginBottom: 4 }}>
              Duration: {formatDuration(currentTrackDuration)}
            </Text>

            {episode.description && (
              <Text
                style={{
                  opacity: 0.6,
                  fontSize: 12,
                  lineHeight: 16,
                  marginTop: 4,
                }}
                numberOfLines={2}
              >
                {episode.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}

      {filteredEpisodes.length === 0 && (
        <Text style={{ textAlign: "center", opacity: 0.6, marginTop: 20 }}>
          No episodes found for "{selectedShow}"
        </Text>
      )}
    </View>
  );
}
