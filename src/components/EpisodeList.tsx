import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PodcastEpisode } from "../types/types";

interface EpisodeListProps {
  episodes: PodcastEpisode[];
  onEpisodePress: (episodeId: string) => void;
}

export default function EpisodeList({
  episodes,
  onEpisodePress,
}: EpisodeListProps) {
  const formatDuration = (seconds: number) => {
    return Math.floor(seconds / 60);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {episodes.map((episode) => (
        <TouchableOpacity
          key={episode.id}
          style={{
            padding: 12,
            backgroundColor: "#f5f5f5",
            marginBottom: 8,
            borderRadius: 8,
          }}
          onPress={() => onEpisodePress(episode.id)}
        >
          <Text style={{ fontWeight: "600" }}>{episode.title}</Text>
          <Text style={{ opacity: 0.7 }}>
            {formatDuration(episode.duration)} minutes
          </Text>
          {episode.description && (
            <Text style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>
              {episode.description}
            </Text>
          )}
          {episode.publishDate && (
            <Text style={{ opacity: 0.5, fontSize: 11, marginTop: 2 }}>
              Published: {new Date(episode.publishDate).toLocaleDateString()}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
