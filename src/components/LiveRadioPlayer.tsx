import React from "react";
import { View, Text, Button, Platform, StyleSheet } from "react-native";
import TrackPlayer, {
  usePlaybackState,
  State,
} from "react-native-track-player";
import { RadioProgram } from "../types/types";

// @ts-ignore
import ReactAudioPlayer from "react-audio-player";

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream";

interface LiveRadioPlayerProps {
  currentProgram?: RadioProgram | null;
}

export default function LiveRadioPlayer({
  currentProgram,
}: LiveRadioPlayerProps) {
  const playback = usePlaybackState();

  const togglePlayPause = async () => {
    if (Platform.OS === "web") return;

    const isPlaying = playback.state === State.Playing;
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const isPlaying =
    Platform.OS === "web" ? false : playback.state === State.Playing;

  // Web audio player component
  const WebAudioPlayer = () => {
    if (Platform.OS !== "web") return null;

    return (
      <View style={styles.webPlayerContainer}>
        <ReactAudioPlayer src={STREAM_URL} controls autoPlay />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Now Playing Section */}
      <View style={styles.nowPlayingContainer}>
        <Text style={styles.nowPlayingLabel}>📻 Live Radio</Text>
        {currentProgram ? (
          <>
            <Text style={styles.nowPlayingTitle} numberOfLines={1}>
              {currentProgram.name}
            </Text>
            <Text style={styles.nowPlayingShow}>
              {currentProgram.host
                ? `with ${currentProgram.host}`
                : "Indigo FM"}
            </Text>
            <Text style={styles.timeText}>
              {currentProgram.startTime} - {currentProgram.endTime}
            </Text>
          </>
        ) : (
          <Text style={styles.nowPlayingTitle}>Indigo FM Live</Text>
        )}
      </View>

      {/* Web Audio Player */}
      <WebAudioPlayer />

      {/* Playback Controls - Mobile only */}
      {Platform.OS !== "web" && (
        <View style={styles.controlsContainer}>
          <Button
            title={isPlaying ? "Pause Live" : "Play Live"}
            onPress={togglePlayPause}
          />
        </View>
      )}

      {Platform.OS !== "web" && (
        <Text style={styles.stateText}>
          State: {String(playback?.state ?? "unknown")}
        </Text>
      )}
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
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.7,
  },
  webPlayerContainer: {
    marginBottom: 12,
  },
  controlsContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  stateText: {
    opacity: 0.6,
    textAlign: "center",
    fontSize: 12,
  },
});
