import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
} from "react-native-track-player";
import CustomSlider from "./CustomSlider";
import WebAudioPlayer, {
  AudioState,
  WebAudioPlayerRef,
} from "./WebAudioPlayer";
import { audioService } from "../services/AudioService";
import { usePlayer } from "../contexts/PlayerContext";
import useShowDetails from "../hooks/useShowDetails";
import { ShowDefinition } from "../types/types";

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream";

interface UniversalPlayerProps {
  onGoToShow?: (showName: string) => void;
  onShowDetails?: (showName: string) => void;
}

export default function UniversalPlayer({
  onGoToShow,
  onShowDetails,
}: UniversalPlayerProps) {
  const { currentContent, isPlayerVisible } = usePlayer();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const webAudioRef = useRef<WebAudioPlayerRef>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [webError, setWebError] = useState<string | null>(null);

  // Mobile state
  const mobilePlayback = usePlaybackState();
  const mobileProgress = useProgress();

  // Web state
  const [webAudioState, setWebAudioState] = useState<AudioState>({
    position: 0,
    duration: 0,
    isPlaying: false,
    isLoading: false,
  });

  // Use the hook to get show details for artwork
  const { findShowByName } = useShowDetails();

  // Get content-specific data - MOVED UP BEFORE useEffects
  const getContentData = () => {
    if (!currentContent) {
      return {
        title: "",
        subtitle: "",
        artwork: undefined,
        audioUrl: "",
        icon: "♪",
      };
    }

    if (currentContent.type === "podcast") {
      const episode = currentContent.episode;
      const showDef = findShowByName(episode.show);
      return {
        title: episode.title,
        subtitle: episode.show,
        artwork: showDef?.artwork,
        audioUrl: episode.url,
        icon: "♪",
      };
    } else {
      const program = currentContent.program;
      const showDef = program ? findShowByName(program.name) : null;
      return {
        title: program?.name || "Indigo FM Live",
        subtitle: program?.host ? `Hosted by ${program.host}` : "Live Radio",
        artwork: showDef?.artwork,
        audioUrl: STREAM_URL,
        icon: "📻",
      };
    }
  };

  // Set up web audio state listener and player ref
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

  // Handle content changes and audio URL updates
  useEffect(() => {
    if (!currentContent) {
      setCurrentAudioUrl("");
      setWebError(null);
      return;
    }

    const contentData = getContentData();
    const newAudioUrl = contentData.audioUrl;

    // Only update audio URL if it's actually different
    if (newAudioUrl !== currentAudioUrl) {
      console.log(
        "Audio URL changing from",
        currentAudioUrl,
        "to",
        newAudioUrl
      );

      // Clear any previous errors
      setWebError(null);

      // Signal that we're transitioning
      if (Platform.OS === "web") {
        audioService.setTransitioning(true);
      }

      setCurrentAudioUrl(newAudioUrl);

      // Clear transitioning flag after a short delay
      setTimeout(() => {
        if (Platform.OS === "web") {
          audioService.setTransitioning(false);
        }
      }, 100);
    }
  }, [currentContent, currentAudioUrl]);

  if (!isPlayerVisible || !currentContent) {
    return null;
  }

  // Get current state based on platform
  const playback =
    Platform.OS === "web"
      ? { state: webAudioState.isPlaying ? State.Playing : State.Paused }
      : mobilePlayback;

  const progress =
    Platform.OS === "web"
      ? { position: webAudioState.position, duration: webAudioState.duration }
      : mobileProgress;

  // Determine if we're in a loading/buffering state
  const isLoading =
    Platform.OS === "web"
      ? webAudioState.isLoading
      : playback.state === State.Loading || playback.state === State.Buffering;

  const isPlaying = playback.state === State.Playing;

  // Loading indicator component
  const LoadingIndicator = ({ color = "#fff" }: { color?: string }) => (
    <View style={styles.loadingContainer}>
      <View style={[styles.loadingDot, { backgroundColor: color }]} />
      <View
        style={[
          styles.loadingDot,
          styles.loadingDot2,
          { backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.loadingDot,
          styles.loadingDot3,
          { backgroundColor: color },
        ]}
      />
    </View>
  );

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = async (value: number) => {
    await audioService.seekTo(value);
  };

  const skipBackward = async () => {
    const newPosition = Math.max(0, progress.position - 15);
    await audioService.seekTo(newPosition);
  };

  const skipForward = async () => {
    const newPosition = Math.min(progress.duration, progress.position + 15);
    await audioService.seekTo(newPosition);
  };

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.play();
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const handleWebAudioError = (error: string) => {
    console.error("Web audio error:", error);
    setWebError(error);

    // If it's a CORS error and we're playing a podcast, show a helpful message
    if (error.includes("CORS") || error.includes("not supported")) {
      if (currentContent?.type === "podcast") {
        setWebError(
          "This podcast episode cannot be played in the web browser due to security restrictions. Please use the mobile app to listen to podcasts."
        );
      } else {
        setWebError(
          "Audio playback failed due to browser security restrictions."
        );
      }
    }
  };

  const contentData = getContentData();

  const handleShowDetailsPress = () => {
    let showName = "";

    if (currentContent?.type === "podcast") {
      showName = currentContent.episode.show;
    } else if (currentContent?.type === "live" && currentContent.program) {
      showName = currentContent.program.name;
    }

    if (showName) {
      // Use the appropriate callback based on context
      if (onShowDetails) {
        onShowDetails(showName);
      } else if (onGoToShow) {
        const showDef = findShowByName(showName);
        if (showDef) {
          onGoToShow(showName);
        }
      }
    }
  };

  // Check if we should show the "go to show" button
  const shouldShowGoToShowButton = () => {
    if (!currentContent) return false;

    let showName = "";
    if (currentContent.type === "podcast") {
      showName = currentContent.episode.show;
    } else if (currentContent.type === "live" && currentContent.program) {
      showName = currentContent.program.name;
    }

    return showName && findShowByName(showName);
  };

  // Minimized display
  if (isCollapsed) {
    return (
      <View style={styles.minimizedContainer}>
        <View style={styles.minimizedContent}>
          {/* Artwork */}
          <View style={styles.minimizedArtworkContainer}>
            {contentData.artwork ? (
              <Image
                source={{ uri: contentData.artwork }}
                style={styles.minimizedArtwork}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.minimizedPlaceholderArtwork}>
                <Text style={styles.minimizedPlaceholderText}>
                  {contentData.icon}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={toggleCollapsed}
            style={styles.minimizedInfo}
          >
            <Text style={styles.minimizedTitle} numberOfLines={1}>
              {contentData.title}
            </Text>
            <Text style={styles.minimizedShow} numberOfLines={1}>
              {contentData.subtitle}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.minimizedPlayButton}
            onPress={togglePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingIndicator color="#000" />
            ) : (
              <Text style={styles.minimizedPlayButtonText}>
                {isPlaying ? "||" : "▶"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Web Audio Player Component */}
        {Platform.OS === "web" && (
          <WebAudioPlayer
            ref={webAudioRef}
            src={contentData.audioUrl}
            onStateChange={(state) => audioService.updateWebAudioState(state)}
            onLoad={() => console.log("Audio loaded")}
            onError={(error) => console.error("Audio error:", error)}
            autoPlay={false}
          />
        )}
      </View>
    );
  }

  // Full expanded display
  return (
    <View style={styles.expandedContainer}>
      {/* Web Audio Player Component - Only render when we have an audio URL */}
      {Platform.OS === "web" && currentAudioUrl && (
        <WebAudioPlayer
          ref={webAudioRef}
          src={currentAudioUrl}
          onStateChange={(state) => audioService.updateWebAudioState(state)}
          onLoad={() => {
            console.log("Audio loaded:", currentAudioUrl);
            setWebError(null);
          }}
          onError={handleWebAudioError}
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
            {contentData.title}
          </Text>
        </View>
      </View>

      <View style={styles.expandedContent}>
        {/* Error Message for Web */}
        {Platform.OS === "web" && webError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {webError}</Text>
          </View>
        )}

        {/* Content details with artwork */}
        <View style={styles.contentDetails}>
          <View style={styles.contentHeader}>
            {/* Large Artwork */}
            <View style={styles.artworkContainer}>
              {contentData.artwork ? (
                <Image
                  source={{ uri: contentData.artwork }}
                  style={styles.artwork}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderArtwork}>
                  <Text style={styles.placeholderText}>{contentData.icon}</Text>
                </View>
              )}
            </View>

            {/* Content Info */}
            <View style={styles.contentInfo}>
              <Text style={styles.nowPlayingShow}>{contentData.subtitle}</Text>
              {currentContent.type === "live" && currentContent.program && (
                <Text style={styles.timeText}>
                  {currentContent.program.startTime} -{" "}
                  {currentContent.program.endTime}
                </Text>
              )}

              {/* Go to Show Button */}
              {shouldShowGoToShowButton() && (
                <TouchableOpacity
                  style={styles.goToShowButton}
                  onPress={handleShowDetailsPress}
                >
                  <Text style={styles.goToShowButtonText}>
                    VIEW SHOW DETAILS
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Progress Bar and Time Display - Only for podcasts */}
        {currentContent.type === "podcast" && progress.duration > 0 && (
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
          {currentContent.type === "podcast" && (
            <TouchableOpacity style={styles.skipButton} onPress={skipBackward}>
              <Text style={styles.skipButtonText}>← 15S</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.playButton,
              isPlaying ? styles.pauseButton : styles.playButtonActive,
              Platform.OS === "web" && webError && styles.disabledButton,
              isLoading && styles.loadingButton,
            ]}
            onPress={togglePlayPause}
            disabled={(Platform.OS === "web" && !!webError) || isLoading}
          >
            {isLoading ? (
              <LoadingIndicator color={isPlaying ? "#fff" : "#000"} />
            ) : (
              <Text
                style={[
                  styles.playButtonText,
                  isPlaying
                    ? styles.pauseButtonText
                    : styles.playButtonActiveText,
                  Platform.OS === "web" &&
                    webError &&
                    styles.disabledButtonText,
                ]}
              >
                {isPlaying
                  ? "PAUSE"
                  : currentContent.type === "live"
                  ? "PLAY LIVE"
                  : "PLAY"}
              </Text>
            )}
          </TouchableOpacity>

          {currentContent.type === "podcast" && (
            <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
              <Text style={styles.skipButtonText}>15S →</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.stateText}>
          Status: {webError ? "error" : isPlaying ? "playing" : "paused"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...existing code from PlayingWindow styles...
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
    shadowOffset: { width: 0, height: -4 },
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
    shadowOffset: { width: 0, height: -4 },
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
  contentDetails: {
    marginBottom: 16,
  },
  contentHeader: {
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
  contentInfo: {
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
  progressContainer: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
  errorContainer: {
    backgroundColor: "#ff4444",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#666",
    borderColor: "#666",
  },
  disabledButtonText: {
    color: "#999",
  },
  loadingButton: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  loadingDot2: {
    opacity: 0.6,
  },
  loadingDot3: {
    opacity: 0.9,
  },
  goToShowButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  goToShowButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
