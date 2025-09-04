import React, { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import TrackPlayer, { useProgress } from "react-native-track-player";
import EpisodeList from "./EpisodeList";
import PlayingWindow from "./PlayingWindow";
import { PodcastEpisode } from "../types/types";
import podcastEpisodes from "../data/podcastEpisodes.json";

// @ts-ignore
import ReactAudioPlayer from "react-audio-player";

// Cast the imported JSON to the proper type
const PODCAST_EPISODES: PodcastEpisode[] = podcastEpisodes;

interface PodcastProps {
  onNowPlayingUpdate: (title: string) => void;
  initialFilter?: string;
}

export default function Podcast({
  onNowPlayingUpdate,
  initialFilter,
}: PodcastProps) {
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState<string>("");
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState<string>("");
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(
    null
  );

  // Only use progress on mobile
  const progress = Platform.OS !== "web" ? useProgress() : { duration: 0 };

  const loadPodcasts = async () => {
    if (Platform.OS !== "web") {
      await TrackPlayer.reset();
      await TrackPlayer.add(PODCAST_EPISODES);
    }
    onNowPlayingUpdate("Podcast Episodes Loaded");
  };

  const playEpisode = async (episodeId: string) => {
    const episode = PODCAST_EPISODES.find((ep) => ep.id === episodeId);
    if (episode) {
      setCurrentEpisode(episode);
      if (Platform.OS === "web") {
        setCurrentEpisodeUrl(episode.url);
        setCurrentEpisodeTitle(episode.title);
        onNowPlayingUpdate(episode.title);
      } else {
        const episodeIndex = PODCAST_EPISODES.findIndex(
          (ep) => ep.id === episodeId
        );
        if (episodeIndex !== -1) {
          await TrackPlayer.skip(episodeIndex);
          await TrackPlayer.play();
          onNowPlayingUpdate(episode.title);
        }
      }
    }
  };

  useEffect(() => {
    loadPodcasts();
  }, []);

  // Web audio player component
  const WebAudioPlayer = () => {
    if (Platform.OS !== "web" || !currentEpisodeUrl) return null;

    return (
      <View style={styles.webPlayerContainer}>
        <Text style={styles.webPlayerTitle}>{currentEpisodeTitle}</Text>
        <ReactAudioPlayer src={currentEpisodeUrl} controls />
      </View>
    );
  };

  // Web implementation
  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>Podcast Episodes</Text>

        <View style={styles.webEpisodeList}>
          <EpisodeList
            episodes={PODCAST_EPISODES}
            onEpisodePress={playEpisode}
            currentTrackDuration={0}
          />
        </View>

        <WebAudioPlayer />
      </View>
    );
  }

  // Mobile implementation - Remove ScrollView wrapper
  return (
    <View style={styles.container}>
      {/* Episodes List Component with built-in header */}
      <EpisodeList
        episodes={PODCAST_EPISODES}
        onEpisodePress={playEpisode}
        currentTrackDuration={progress.duration}
        showTitle={true}
        initialFilter={initialFilter}
      />

      {/* Playing Window Component - Fixed at Bottom */}
      <PlayingWindow currentEpisode={currentEpisode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 180, // Add padding to prevent content from being hidden behind floating player
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  webContainer: {
    flex: 1,
    height: "100%",
  },
  webTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  webEpisodeList: {
    flex: 1,
    marginBottom: 20,
  },
  webPlayerContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 16,
  },
  webPlayerTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
});
