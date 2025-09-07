import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

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
    try {
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        // If no episode is loaded, don't try to play
        if (!currentEpisode) {
          console.log("No episode loaded");
          return;
        }
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  // Minimized display
  if (isCollapsed) {
    return (
      <View style={styles.minimizedContainer}>
        <View style={styles.minimizedContent}>
          <TouchableOpacity
            onPress={toggleCollapsed}
            style={styles.minimizedInfo}
          >
            <Text style={styles.minimizedTitle} numberOfLines={1}>
              {currentEpisode ? currentEpisode.title : "Select an Episode"}
            </Text>
            {currentEpisode && (
              <Text style={styles.minimizedShow} numberOfLines={1}>
                {currentEpisode.show}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.minimizedPlayButton,
              !currentEpisode && styles.disabledButton,
            ]}
            onPress={togglePlayPause}
            disabled={!currentEpisode}
          >
            <Text
              style={[
                styles.minimizedPlayButtonText,
                !currentEpisode && styles.disabledButtonText,
              ]}
            >
              {isPlaying ? "||" : "▶"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Full expanded display
  return (
    <View style={styles.expandedContainer}>
      {/* Header with collapse button */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={toggleCollapsed}
            style={styles.collapseButton}
          >
            <Text style={styles.collapseIcon}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleRow}>
          {currentEpisode ? (
            <Text style={styles.nowPlayingTitle} numberOfLines={1}>
              {currentEpisode.title}
            </Text>
          ) : (
            <Text style={styles.nowPlayingTitle}>Select an Episode</Text>
          )}
        </View>
      </View>

      <View style={styles.expandedContent}>
        {/* Episode details */}
        {currentEpisode && (
          <View style={styles.episodeDetails}>
            <Text style={styles.nowPlayingShow}>{currentEpisode.show}</Text>
          </View>
        )}

        {/* Progress Bar and Time Display */}
        {progress.duration > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(progress.position)}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(progress.duration)}
              </Text>
            </View>

            <CustomSlider
              value={progress.position}
              maximumValue={progress.duration}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#444"
              thumbColor="#fff"
            />
          </View>
        )}

        {/* Playback Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={skipBackward}>
            <Text style={styles.skipButtonText}>← 15S</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playButton,
              isPlaying ? styles.pauseButton : styles.playButtonActive,
              !currentEpisode && styles.disabledButton,
            ]}
            onPress={togglePlayPause}
            disabled={!currentEpisode}
          >
            <Text
              style={[
                styles.playButtonText,
                isPlaying
                  ? styles.pauseButtonText
                  : styles.playButtonActiveText,
                !currentEpisode && styles.disabledButtonText,
              ]}
            >
              {isPlaying ? "PAUSE" : "PLAY"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
            <Text style={styles.skipButtonText}>15S →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.stateText}>
          Status: {String(playback?.state ?? "unknown")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Minimized styles
  minimizedContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#333",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 1000,
    height: 80,
    maxWidth: Platform.OS === "web" ? 1200 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
    width: "100%",
  },
  minimizedContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    maxWidth: "100%",
  },
  minimizedInfo: {
    flex: 1,
    marginRight: 16,
    justifyContent: "center",
    minWidth: 0, // Important for text truncation on web
  },
  minimizedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  minimizedShow: {
    fontSize: 12,
    color: "#ccc",
    fontWeight: "500",
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  minimizedPlayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#fff",
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  minimizedPlayButtonText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
  },

  // Expanded styles
  expandedContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#333",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Platform.OS === "web" ? 24 : 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 1000,
    maxWidth: Platform.OS === "web" ? 1200 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
    width: "100%",
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expandedContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  episodeDetails: {
    marginBottom: 16,
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 0.5,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  nowPlayingShow: {
    fontSize: 14,
    color: "#ccc",
    fontWeight: "500",
    marginBottom: 4,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
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
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: "#333",
    minWidth: 60,
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  playButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    minWidth: Platform.OS === "web" ? 140 : 120,
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
  disabledButton: {
    opacity: 0.5,
    borderColor: "#666",
  },
  disabledButtonText: {
    color: "#666",
  },
});
