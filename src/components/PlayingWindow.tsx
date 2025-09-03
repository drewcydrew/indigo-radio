import React from "react";
import { View, Text, Button } from "react-native";
import TrackPlayer, {
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import CustomSlider from "./CustomSlider";

interface PlayingWindowProps {
  showSkipControls?: boolean;
}

export default function PlayingWindow({
  showSkipControls = true,
}: PlayingWindowProps) {
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
        <Button title="Play" onPress={() => TrackPlayer.play()} />
        <Button title="Pause" onPress={() => TrackPlayer.pause()} />
        <Button title="Stop" onPress={() => TrackPlayer.stop()} />
        {showSkipControls && (
          <>
            <Button
              title="Previous"
              onPress={() => TrackPlayer.skipToPrevious()}
            />
            <Button title="Next" onPress={() => TrackPlayer.skipToNext()} />
          </>
        )}
      </View>

      <Text style={{ opacity: 0.6 }}>
        State: {String(playback?.state ?? "unknown")}
      </Text>
    </View>
  );
}
