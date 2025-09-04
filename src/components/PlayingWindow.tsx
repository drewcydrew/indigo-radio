import React from "react";
import { View, Text, Button } from "react-native";
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
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14, opacity: 0.7 }}>
              {formatTime(progress.position)}
            </Text>
            <Text style={{ fontSize: 14, opacity: 0.7 }}>
              {formatTime(progress.duration)}
            </Text>
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
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <Button title="← 15s" onPress={skipBackward} />
        <Button
          title={isPlaying ? "Pause" : "Play"}
          onPress={togglePlayPause}
        />
        <Button title="15s →" onPress={skipForward} />
      </View>

      <Text style={{ opacity: 0.6 }}>
        State: {String(playback?.state ?? "unknown")}
      </Text>
    </View>
  );
}
