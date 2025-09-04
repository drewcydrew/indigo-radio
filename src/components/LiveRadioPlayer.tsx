import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [animation] = useState(new Animated.Value(1));

  const toggleCollapsed = () => {
    const toValue = isCollapsed ? 1 : 0.3;

    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsCollapsed(!isCollapsed);
  };

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
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              scaleY: animation,
            },
          ],
          opacity: animation,
        },
      ]}
    >
      {/* Header with collapse button */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={toggleCollapsed}
            style={styles.collapseButton}
          >
            <Text style={styles.collapseIcon}>{isCollapsed ? "⌃" : "⌄"}</Text>
          </TouchableOpacity>
        </View>

        {/* Always show current program title even when collapsed */}
        {currentProgram ? (
          <Text
            style={[
              styles.nowPlayingTitle,
              isCollapsed && styles.collapsedTitle,
            ]}
            numberOfLines={1}
          >
            {currentProgram.name}
          </Text>
        ) : (
          <Text
            style={[
              styles.nowPlayingTitle,
              isCollapsed && styles.collapsedTitle,
            ]}
          >
            Indigo FM Live
          </Text>
        )}
      </View>

      {/* Collapsible content */}
      {!isCollapsed && (
        <View style={styles.expandedContent}>
          {/* Program details */}
          {currentProgram && (
            <View style={styles.programDetails}>
              <Text style={styles.nowPlayingShow}>
                {currentProgram.host
                  ? `Hosted by ${currentProgram.host}`
                  : "Indigo FM"}
              </Text>
              <Text style={styles.timeText}>
                {currentProgram.startTime} - {currentProgram.endTime}
              </Text>
            </View>
          )}

          {/* Web Audio Player */}
          <WebAudioPlayer />

          {/* Playback Controls - Mobile only */}
          {Platform.OS !== "web" && (
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[
                  styles.playButton,
                  isPlaying ? styles.pauseButton : styles.playButtonActive,
                ]}
                onPress={togglePlayPause}
              >
                <Text
                  style={[
                    styles.playButtonText,
                    isPlaying
                      ? styles.pauseButtonText
                      : styles.playButtonActiveText,
                  ]}
                >
                  {isPlaying ? "PAUSE" : "PLAY LIVE"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {Platform.OS !== "web" && (
            <Text style={styles.stateText}>
              Status: {String(playback?.state ?? "unknown")}
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#333",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 1000,
    transformOrigin: "bottom",
  },
  headerContainer: {
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  collapseButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#333",
  },
  collapseIcon: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  expandedContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  programDetails: {
    marginBottom: 16,
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  collapsedTitle: {
    fontSize: 16,
    marginBottom: 0,
  },
  nowPlayingShow: {
    fontSize: 14,
    color: "#ccc",
    fontWeight: "500",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  webPlayerContainer: {
    marginBottom: 16,
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 8,
  },
  controlsContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  playButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    minWidth: 120,
  },
  playButtonActive: {
    backgroundColor: "#fff",
  },
  pauseButton: {
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
  playButtonActiveText: {
    color: "#000",
  },
  pauseButtonText: {
    color: "#fff",
  },
  stateText: {
    color: "#666",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Remove unused styles
  nowPlayingContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
