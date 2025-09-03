import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import TrackPlayer, { useProgress } from "react-native-track-player";
import EpisodeList from "./EpisodeList";
import PlayingWindow from "./PlayingWindow";
import { PodcastEpisode } from "../types/types";
import podcastEpisodes from "../data/podcastEpisodes.json";

// Cast the imported JSON to the proper type
const PODCAST_EPISODES: PodcastEpisode[] = podcastEpisodes;

interface PodcastProps {
  onNowPlayingUpdate: (title: string) => void;
}

export default function Podcast({ onNowPlayingUpdate }: PodcastProps) {
  const progress = useProgress();

  const loadPodcasts = async () => {
    await TrackPlayer.reset();
    await TrackPlayer.add(PODCAST_EPISODES);
    onNowPlayingUpdate("Podcast Episodes Loaded");
  };

  const playEpisode = async (episodeId: string) => {
    const episode = PODCAST_EPISODES.find((ep) => ep.id === episodeId);
    if (episode) {
      const episodeIndex = PODCAST_EPISODES.findIndex(
        (ep) => ep.id === episodeId
      );
      if (episodeIndex !== -1) {
        await TrackPlayer.skip(episodeIndex);
        await TrackPlayer.play();
        onNowPlayingUpdate(episode.title);
      }
    }
  };

  useEffect(() => {
    loadPodcasts();
  }, []);

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
