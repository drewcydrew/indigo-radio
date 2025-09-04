import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
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
  const [animation] = useState(new Animated.Value(1));

  const toggleCollapsed = () => {
    const toValue = isCollapsed ? 1 : 0.4;

    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

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
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
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
          <View style={styles.podcastIndicatorContainer}>
            <View style={styles.podcastDot} />
            <Text style={styles.nowPlayingLabel}>PODCAST PLAYER</Text>
          </View>
          <TouchableOpacity
            onPress={toggleCollapsed}
            style={styles.collapseButton}
          >
            <Text style={styles.collapseIcon}>{isCollapsed ? "⌃" : "⌄"}</Text>
          </TouchableOpacity>
        </View>

        {/* Always show current episode title even when collapsed */}
        {currentEpisode ? (
          <Text
            style={[
              styles.nowPlayingTitle,
              isCollapsed && styles.collapsedTitle,
            ]}
            numberOfLines={1}
          >
            {currentEpisode.title}
          </Text>
        ) : (
          <Text
            style={[
              styles.nowPlayingTitle,
              isCollapsed && styles.collapsedTitle,
            ]}
          >
            Select an Episode
          </Text>
        )}
      </View>

      {/* Collapsible content */}
      {!isCollapsed && (
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  podcastIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  podcastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginRight: 8,
  },
  nowPlayingLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 1,
    textTransform: "uppercase",
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
  episodeDetails: {
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
});
