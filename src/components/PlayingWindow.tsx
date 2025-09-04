import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
} from "react-native-track-player";
import CustomSlider from "./CustomSlider";

interface PlayingWindowProps {}

export default function PlayingWindow({}: PlayingWindowProps) {
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
    <View>
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
  progressContainer: {
    marginBottom: 20,
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
    marginBottom: 20,
  },
  stateText: {
    opacity: 0.6,
  },
});
