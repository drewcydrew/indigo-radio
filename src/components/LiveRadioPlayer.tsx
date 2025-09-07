import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import TrackPlayer, {
  usePlaybackState,
  State,
} from "react-native-track-player";
import WebAudioPlayer, {
  AudioState,
  WebAudioPlayerRef,
} from "./WebAudioPlayer";
import { audioService } from "../services/AudioService";
import { RadioProgram } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream";

interface LiveRadioPlayerProps {
  currentProgram?: RadioProgram | null;
}

export default function LiveRadioPlayer({
  currentProgram,
}: LiveRadioPlayerProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isStreamLoaded, setIsStreamLoaded] = useState(false);
  const webAudioRef = useRef<WebAudioPlayerRef>(null);

  // Mobile state
  const mobilePlayback = usePlaybackState();

  // Web state
  const [webAudioState, setWebAudioState] = useState<AudioState>({
    position: 0,
    duration: 0,
    isPlaying: false,
    isLoading: false,
  });

  // Use the hook to get show details for artwork
  const { findShowByName } = useShowDetails();

  // Get artwork for current program
  const getProgramArtwork = (): string | undefined => {
    if (!currentProgram) return undefined;
    const showDef = findShowByName(currentProgram.name);
    return showDef?.artwork;
  };

  // Set up web audio state listener
  useEffect(() => {
    if (Platform.OS === "web") {
      audioService.setWebAudioStateListener(setWebAudioState);
      audioService.setWebAudioPlayerRef(webAudioRef.current);
    }
  }, []);

  // Update audio service ref when it changes
  useEffect(() => {
    if (Platform.OS === "web") {
      audioService.setWebAudioPlayerRef(webAudioRef.current);
    }
  }, [webAudioRef.current]);

  // Ensure stream is loaded when component mounts (mobile only)
  useEffect(() => {
    const initializeStream = async () => {
      if (Platform.OS !== "web") {
        try {
          // Check if there's already a track loaded
          const queue = await TrackPlayer.getQueue();
          if (queue.length === 0) {
            const artwork = getProgramArtwork();
            await TrackPlayer.add({
              id: "live",
              url: STREAM_URL,
              title: currentProgram?.name || "Indigo FM Live",
              artist: currentProgram?.host || "Live Radio",
              artwork: artwork,
              isLiveStream: true,
            });
          }
          setIsStreamLoaded(true);
        } catch (error) {
          console.error("Error initializing stream:", error);
        }
      }
    };

    initializeStream();
  }, [currentProgram]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const togglePlayPause = async () => {
    try {
      if (Platform.OS === "web") {
        const isPlaying = webAudioState.isPlaying;
        if (isPlaying) {
          await audioService.pause();
        } else {
          await audioService.play();
        }
        return;
      }

      // Mobile logic
      if (!isStreamLoaded) {
        const artwork = getProgramArtwork();
        await TrackPlayer.add({
          id: "live",
          url: STREAM_URL,
          title: currentProgram?.name || "Indigo FM Live",
          artist: currentProgram?.host || "Live Radio",
          artwork: artwork,
          isLiveStream: true,
        });
        setIsStreamLoaded(true);
      }

      const isPlaying = mobilePlayback.state === State.Playing;
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      // Reset and try again (mobile only)
      if (Platform.OS !== "web") {
        try {
          await TrackPlayer.reset();
          const artwork = getProgramArtwork();
          await TrackPlayer.add({
            id: "live",
            url: STREAM_URL,
            title: currentProgram?.name || "Indigo FM Live",
            artist: currentProgram?.host || "Live Radio",
            artwork: artwork,
            isLiveStream: true,
          });
          await TrackPlayer.play();
          setIsStreamLoaded(true);
        } catch (resetError) {
          console.error("Error resetting player:", resetError);
        }
      }
    }
  };

  const isPlaying =
    Platform.OS === "web"
      ? webAudioState.isPlaying
      : mobilePlayback.state === State.Playing;

  // Minimized display
  if (isCollapsed) {
    return (
      <View style={styles.minimizedContainer}>
        <View style={styles.minimizedContent}>
          {/* Artwork */}
          <View style={styles.minimizedArtworkContainer}>
            {getProgramArtwork() ? (
              <Image
                source={{ uri: getProgramArtwork()! }}
                style={styles.minimizedArtwork}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.minimizedPlaceholderArtwork}>
                <Text style={styles.minimizedPlaceholderText}>📻</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={toggleCollapsed}
            style={styles.minimizedInfo}
          >
            <Text style={styles.minimizedTitle} numberOfLines={1}>
              {currentProgram ? currentProgram.name : "Indigo FM Live"}
            </Text>
            {currentProgram && (
              <Text style={styles.minimizedShow} numberOfLines={1}>
                {currentProgram.host
                  ? `Hosted by ${currentProgram.host}`
                  : "Live Radio"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.minimizedPlayButton}
            onPress={togglePlayPause}
          >
            <Text style={styles.minimizedPlayButtonText}>
              {isPlaying ? "||" : "▶"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Web Audio Player Component */}
        {Platform.OS === "web" && (
          <WebAudioPlayer
            ref={webAudioRef}
            src={STREAM_URL}
            onStateChange={(state) => audioService.updateWebAudioState(state)}
            onLoad={() => console.log("Live stream loaded")}
            onError={(error) => console.error("Live stream error:", error)}
            autoPlay={false}
          />
        )}
      </View>
    );
  }

  // Full expanded display
  return (
    <View style={styles.expandedContainer}>
      {/* Web Audio Player Component */}
      {Platform.OS === "web" && (
        <WebAudioPlayer
          ref={webAudioRef}
          src={STREAM_URL}
          onStateChange={(state) => audioService.updateWebAudioState(state)}
          onLoad={() => console.log("Live stream loaded")}
          onError={(error) => console.error("Live stream error:", error)}
          autoPlay={false}
        />
      )}

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
          <Text style={styles.nowPlayingTitle} numberOfLines={1}>
            {currentProgram ? currentProgram.name : "Indigo FM Live"}
          </Text>
        </View>
      </View>

      <View style={styles.expandedContent}>
        {/* Program details with artwork */}
        <View style={styles.programDetails}>
          <View style={styles.programHeader}>
            {/* Large Artwork */}
            <View style={styles.artworkContainer}>
              {getProgramArtwork() ? (
                <Image
                  source={{ uri: getProgramArtwork()! }}
                  style={styles.artwork}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderArtwork}>
                  <Text style={styles.placeholderText}>📻</Text>
                </View>
              )}
            </View>

            {/* Program Info */}
            <View style={styles.programInfo}>
              <Text style={styles.nowPlayingShow}>
                {currentProgram?.host
                  ? `Hosted by ${currentProgram.host}`
                  : "Indigo FM"}
              </Text>
              {currentProgram && (
                <Text style={styles.timeText}>
                  {currentProgram.startTime} - {currentProgram.endTime}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Playback Controls */}
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

        {Platform.OS !== "web" && (
          <Text style={styles.stateText}>
            Status: {String(mobilePlayback?.state ?? "unknown")}{" "}
            {!isStreamLoaded && "(Loading...)"}
          </Text>
        )}
        {Platform.OS === "web" && (
          <Text style={styles.stateText}>
            Status: {isPlaying ? "playing" : "stopped"}
          </Text>
        )}
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
  minimizedArtworkContainer: {
    marginRight: 12,
  },
  minimizedArtwork: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: "#333",
  },
  minimizedPlaceholderArtwork: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  minimizedPlaceholderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  minimizedInfo: {
    flex: 1,
    marginRight: 16,
    justifyContent: "center",
    minWidth: 0,
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
  programDetails: {
    marginBottom: 16,
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  artworkContainer: {
    marginRight: 16,
  },
  artwork: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  placeholderArtwork: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  programInfo: {
    flex: 1,
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
  timeText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
    letterSpacing: 0.5,
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
});
