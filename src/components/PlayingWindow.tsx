import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
} from "react-native-track-player";
import CustomSlider from "./CustomSlider";
import { PodcastEpisode } from "../types/types";

interface PlayingWindowProps {
  currentEpisode?: PodcastEpisode | null;
}

export default function PlayingWindow({ currentEpisode }: PlayingWindowProps) {
  const playback = usePlaybackState();
  const progress = useProgress();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = async (value: number) => {
    await TrackPlayer.seekTo(value);
  };

  const skipBackward = async () => {
    const newPosition = Math.max(0, progress.position - 15);
    await TrackPlayer.seekTo(newPosition);
  };

  const skipForward = async () => {
    const newPosition = Math.min(progress.duration, progress.position + 15);
    await TrackPlayer.seekTo(newPosition);
  };

  const isPlaying = playback.state === State.Playing;

  const togglePlayPause = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <View style={styles.container}>
      {/* Now Playing Section */}
      {currentEpisode && (
        <View style={styles.nowPlayingContainer}>
          <Text style={styles.nowPlayingLabel}>Now Playing</Text>
          <Text style={styles.nowPlayingTitle} numberOfLines={1}>
            {currentEpisode.title}
          </Text>
          <Text style={styles.nowPlayingShow}>{currentEpisode.show}</Text>
        </View>
      )}

      {/* Progress Bar and Time Display */}
      {progress.duration > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
            <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
          </View>

          <CustomSlider
            value={progress.position}
            maximumValue={progress.duration}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#e0e0e0"
            thumbColor="#007AFF"
          />
        </View>
      )}

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        <Button title="← 15s" onPress={skipBackward} />
        <Button
          title={isPlaying ? "Pause" : "Play"}
          onPress={togglePlayPause}
        />
        <Button title="15s →" onPress={skipForward} />
      </View>

      <Text style={styles.stateText}>
        State: {String(playback?.state ?? "unknown")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  nowPlayingContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  nowPlayingLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  nowPlayingShow: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  progressContainer: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    justifyContent: "center",
  },
  stateText: {
    opacity: 0.6,
    textAlign: "center",
    fontSize: 12,
  },
});
