import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
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
}

export default function Podcast({ onNowPlayingUpdate }: PodcastProps) {
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState<string>("");
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState<string>("");

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

  // Web implementation
  if (Platform.OS === "web") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Podcast Episodes
        </h2>

        <div style={{ flex: 1, overflowY: "auto", marginBottom: 20 }}>
          <EpisodeList
            episodes={PODCAST_EPISODES}
            onEpisodePress={playEpisode}
            currentTrackDuration={0}
          />
        </div>

        {currentEpisodeUrl && (
          <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>
              {currentEpisodeTitle}
            </h3>
            <ReactAudioPlayer src={currentEpisodeUrl} controls />
          </div>
        )}
      </div>
    );
  }

  // Mobile implementation
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
          Podcast Episodes
        </Text>

        {/* Episodes List Component */}
        <EpisodeList
          episodes={PODCAST_EPISODES}
          onEpisodePress={playEpisode}
          currentTrackDuration={progress.duration}
        />
      </ScrollView>

      {/* Playing Window Component - Fixed at Bottom */}
      <PlayingWindow showSkipControls={true} />
    </View>
  );
}
