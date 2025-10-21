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
  Event,
  useTrackPlayerEvents,
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
import ShowDetailsModal from "./ShowDetailsModal";
import UpdateRadioAddressModal from "./UpdateRadioAddressModal";
import useRadioAddress from "../hooks/useRadioAddress";

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
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [lastContentId, setLastContentId] = useState<string>("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Remove selectedShow state since we're not using the button anymore
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  // Use the radio address hook instead of hardcoded URL
  const { radioAddress, updateRadioAddress } = useRadioAddress();

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

  // Handle TrackPlayer errors on mobile
  if (Platform.OS !== "web") {
    useTrackPlayerEvents([Event.PlaybackError], (event) => {
      if (event.type === Event.PlaybackError) {
        console.error("TrackPlayer error:", event);
        handleStreamError(
          "Unable to connect to the radio stream. Please check your internet connection and try again."
        );
      }
    });
  }

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
        audioUrl: radioAddress, // Use the dynamic radio address
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

  // Handle stream errors
  const handleStreamError = (errorMessage: string) => {
    console.error("Stream error:", errorMessage);
    setStreamError(`${errorMessage} (URL: ${radioAddress})`);
    setIsRetrying(false);
  };

  // Retry stream connection
  const retryStream = async () => {
    if (retryCount >= maxRetries) {
      setStreamError("Maximum retry attempts reached. Please try again later.");
      return;
    }

    setIsRetrying(true);
    setStreamError(null);
    setRetryCount((prev) => prev + 1);

    try {
      // Clear any existing errors
      setWebError(null);

      // For mobile, reset TrackPlayer and try again
      if (Platform.OS !== "web") {
        await TrackPlayer.reset();
        const contentData = getContentData();
        await setupTrackForBackground(contentData);
        setTimeout(async () => {
          try {
            await TrackPlayer.play();
            setIsRetrying(false);
            setRetryCount(0); // Reset on success
          } catch (error) {
            console.error("Retry failed:", error);
            handleStreamError(
              `Retry failed. Please check your connection and try again. (URL: ${radioAddress})`
            );
          }
        }, 1000);
      } else {
        // For web, try to reload the audio
        setTimeout(async () => {
          try {
            await audioService.play();
            setIsRetrying(false);
            setRetryCount(0); // Reset on success
          } catch (error) {
            console.error("Web retry failed:", error);
            handleStreamError(
              `Retry failed. Please check your connection and try again. (URL: ${radioAddress})`
            );
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error during retry:", error);
      handleStreamError(
        `Retry failed. Please try again later. (URL: ${radioAddress})`
      );
    }
  };

  // Helper function to get a unique ID for the current content
  const getCurrentContentId = () => {
    if (!currentContent) return "";

    if (currentContent.type === "podcast") {
      return `podcast-${currentContent.episode.id}`;
    } else {
      return "live-radio"; // Live radio always has the same ID
    }
  };

  // Handle content changes and audio URL updates
  useEffect(() => {
    if (!currentContent) {
      setCurrentAudioUrl("");
      setWebError(null);
      setStreamError(null);
      setShouldAutoPlay(false);
      setLastContentId("");
      setRetryCount(0);
      return;
    }

    const contentData = getContentData();
    const newAudioUrl = contentData.audioUrl;
    const currentContentId = getCurrentContentId();

    // Only update if the content ID has actually changed (not just mode switch)
    if (currentContentId !== lastContentId) {
      console.log(
        "Content ID changing from",
        lastContentId,
        "to",
        currentContentId,
        "- Audio URL:",
        newAudioUrl
      );

      // Clear any previous errors
      setWebError(null);
      setStreamError(null);
      setRetryCount(0);

      // For web, ensure audio service is properly initialized
      if (Platform.OS === "web") {
        audioService.setTransitioning(true);
        // Make sure web audio player ref is set
        if (webAudioRef.current) {
          audioService.setWebAudioPlayerRef(webAudioRef.current);
        }
      }
      setShouldAutoPlay(true);

      setCurrentAudioUrl(newAudioUrl);
      setLastContentId(currentContentId);

      // Set up TrackPlayer for mobile background support
      if (Platform.OS !== "web") {
        setupTrackForBackground(contentData);
      }

      // Clear transitioning flag after a short delay
      setTimeout(() => {
        if (Platform.OS === "web") {
          audioService.setTransitioning(false);
        }
      }, 100);
    } else if (newAudioUrl !== currentAudioUrl) {
      // Handle URL changes without content ID changes (like radio address updates)
      console.log(
        "Audio URL changed without content ID change - updating URL only"
      );
      setCurrentAudioUrl(newAudioUrl);

      // For web, reinitialize with new URL
      if (Platform.OS === "web" && webAudioRef.current) {
        audioService.setWebAudioPlayerRef(webAudioRef.current);
        setShouldAutoPlay(true);
      }
    }
  }, [currentContent, lastContentId, radioAddress]); // Add radioAddress dependency

  // Auto-play effect - separate from content change effect
  useEffect(() => {
    const startPlayback = async () => {
      if (shouldAutoPlay && currentAudioUrl && !webError) {
        try {
          console.log("Auto-starting playback for:", currentAudioUrl);

          // Small delay to ensure everything is set up
          setTimeout(async () => {
            try {
              if (Platform.OS !== "web") {
                await TrackPlayer.play();
              } else {
                await audioService.play();
              }
              setShouldAutoPlay(false);
            } catch (error) {
              console.error("Error auto-starting playback:", error);
              setShouldAutoPlay(false);
            }
          }, 200);
        } catch (error) {
          console.error("Error in auto-play setup:", error);
          setShouldAutoPlay(false);
        }
      }
    };

    startPlayback();
  }, [shouldAutoPlay, currentAudioUrl, webError]);

  // New function to set up track for background support
  const setupTrackForBackground = async (contentData: any) => {
    try {
      // Reset TrackPlayer
      await TrackPlayer.reset();

      // Add the track with proper metadata for background controls
      const track = {
        id:
          currentContent?.type === "podcast"
            ? currentContent.episode.id
            : "live-radio",
        url: contentData.audioUrl,
        title: contentData.title,
        artist: contentData.subtitle,
        artwork: contentData.artwork || undefined,
        // Add additional metadata for better background support
        album:
          currentContent?.type === "live" ? "Indigo FM" : contentData.subtitle,
        genre: currentContent?.type === "live" ? "Radio" : "Podcast",
        isLiveStream: currentContent?.type === "live",
      };

      await TrackPlayer.add(track);
      console.log("Track added to TrackPlayer for background support:", track);
    } catch (error) {
      console.error("Error setting up track for background:", error);
    }
  };

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
    if (Platform.OS !== "web") {
      await TrackPlayer.seekTo(value);
    } else {
      await audioService.seekTo(value);
    }
  };

  const skipBackward = async () => {
    const newPosition = Math.max(0, progress.position - 15);
    if (Platform.OS !== "web") {
      await TrackPlayer.seekTo(newPosition);
    } else {
      await audioService.seekTo(newPosition);
    }
  };

  const skipForward = async () => {
    const newPosition = Math.min(progress.duration, progress.position + 15);
    if (Platform.OS !== "web") {
      await TrackPlayer.seekTo(newPosition);
    } else {
      await audioService.seekTo(newPosition);
    }
  };

  const togglePlayPause = async () => {
    try {
      // Clear any existing stream errors when user tries to play
      if (!isPlaying) {
        setStreamError(null);
        setRetryCount(0);
      }

      if (Platform.OS !== "web") {
        // Use TrackPlayer directly for better background support
        if (isPlaying) {
          await TrackPlayer.pause();
        } else {
          await TrackPlayer.play();
        }
      } else {
        // Use audioService for web
        if (isPlaying) {
          await audioService.pause();
        } else {
          await audioService.play();
        }
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
      if (currentContent?.type === "live") {
        handleStreamError(
          "Unable to connect to the radio stream. Please try again."
        );
      } else {
        setWebError("Playback failed. Please try again.");
      }
    }
  };

  const handleWebAudioError = (error: string) => {
    console.error("Web audio error:", error);

    // Check if it's a network/stream error
    if (
      error.includes("NETWORK_ERR") ||
      error.includes("failed to load") ||
      error.includes("404")
    ) {
      handleStreamError(
        "Unable to connect to the radio stream. Please check your internet connection and try again."
      );
      return;
    }

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

  const handleUpdateRadioAddress = async (newPort: string) => {
    const newUrl = `https://internetradio.indigofm.au:${newPort}/stream`;
    updateRadioAddress(newUrl); // Use the hook's update function
    setIsUpdateModalVisible(false);
    setStreamError(null); // Clear any existing errors

    try {
      // Reset the player and reinitialize with the new URL
      if (Platform.OS !== "web") {
        await TrackPlayer.reset();
        const contentData = getContentData();
        await setupTrackForBackground({ ...contentData, audioUrl: newUrl });
      } else {
        audioService.setWebAudioPlayerRef(webAudioRef.current);
        await audioService.add({
          id: "live-radio",
          url: newUrl,
          title: "Indigo FM Live",
          artist: "Live Radio",
        });
      }
      console.log("Updated radio address to:", newUrl);
    } catch (error) {
      console.error("Error updating radio address:", error);
      setStreamError("Failed to update the radio address. Please try again.");
    }
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
            disabled={isLoading || isRetrying}
          >
            {isLoading || isRetrying ? (
              <LoadingIndicator color="#000" />
            ) : (
              <Text style={styles.minimizedPlayButtonText}>
                {isPlaying ? "❚❚" : "▶"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Web Audio Player Component - Always render on web */}
        {Platform.OS === "web" && (
          <WebAudioPlayer
            ref={webAudioRef}
            src={currentAudioUrl || ""}
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
    <View style={styles.expandedOverlay}>
      {/* Backdrop - Click to minimize */}
      <TouchableOpacity
        style={styles.backdrop}
        onPress={toggleCollapsed}
        activeOpacity={1}
      />

      <View style={styles.expandedContainer}>
        {/* Web Audio Player Component - Always render on web */}
        {Platform.OS === "web" && (
          <WebAudioPlayer
            ref={webAudioRef}
            src={currentAudioUrl || ""}
            onStateChange={(state) => audioService.updateWebAudioState(state)}
            onLoad={() => {
              console.log("Audio loaded:", currentAudioUrl);
              setWebError(null);
            }}
            onError={handleWebAudioError}
            autoPlay={false}
          />
        )}

        {/* Header with drag indicator and collapse button */}
        <View style={styles.headerContainer}>
          <View style={styles.dragIndicator} />

          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={toggleCollapsed}
              style={styles.collapseButton}
            >
              <Text style={styles.collapseIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.nowPlayingTitle} numberOfLines={1}>
              {contentData.title}
            </Text>
          </View>
        </View>

        <View style={styles.expandedContent}>
          {/* Error Messages */}
          {streamError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>📡 {streamError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryStream}
                disabled={isRetrying}
              >
                <Text style={styles.retryButtonText}>
                  {isRetrying ? "RETRYING..." : "TRY AGAIN"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => setIsUpdateModalVisible(true)}
              >
                <Text style={styles.updateButtonText}>
                  UPDATE RADIO ADDRESS
                </Text>
              </TouchableOpacity>
              {retryCount > 0 && (
                <Text style={styles.retryCountText}>
                  Attempt {retryCount} of {maxRetries}
                </Text>
              )}
            </View>
          )}

          {Platform.OS === "web" && webError && !streamError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {webError}</Text>
            </View>
          )}

          {/* Content details with artwork */}
          <View style={styles.contentDetails}>
            {/* Large Artwork - Centered */}
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

            {/* Content Info - Centered */}
            <View style={styles.contentInfo}>
              <Text style={styles.nowPlayingShow}>{contentData.subtitle}</Text>
              {currentContent.type === "live" && currentContent.program && (
                <Text style={styles.timeText}>
                  {currentContent.program.startTime} -{" "}
                  {currentContent.program.endTime}
                </Text>
              )}
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
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skipBackward}
              >
                <Text style={styles.skipButtonText}>← 15</Text>
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
              disabled={
                (Platform.OS === "web" && !!webError && !streamError) ||
                isLoading ||
                isRetrying
              }
            >
              {isLoading ? (
                <LoadingIndicator color={isPlaying ? "#fff" : "#000"} />
              ) : (
                <Text
                  style={[
                    styles.playButtonIcon,
                    isPlaying
                      ? styles.pauseButtonIcon
                      : styles.playButtonActiveIcon,
                    Platform.OS === "web" &&
                      webError &&
                      styles.disabledButtonIcon,
                  ]}
                >
                  {isPlaying ? "❚❚" : "▶︎"}
                </Text>
              )}
            </TouchableOpacity>

            {currentContent.type === "podcast" && (
              <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
                <Text style={styles.skipButtonText}>15 →</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Update Radio Address Modal */}
          {isUpdateModalVisible && (
            <UpdateRadioAddressModal
              onClose={() => setIsUpdateModalVisible(false)}
              onUpdate={handleUpdateRadioAddress}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...existing minimized styles...
  minimizedContainer: {
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
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
  expandedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  expandedContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: Platform.OS === "web" ? 32 : 24,
    paddingBottom: Platform.OS === "web" ? 32 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
    maxWidth: Platform.OS === "web" ? 600 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
    maxHeight: "80%",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
    alignSelf: "center",
    marginBottom: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
  },
  collapseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#333",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  collapseIcon: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  titleRow: {
    alignItems: "center",
  },
  expandedContent: {
    flex: 1,
  },
  contentDetails: {
    alignItems: "center",
    marginBottom: 32,
  },
  artworkContainer: {
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  artwork: {
    width: 180,
    height: 180,
    borderRadius: 16,
    backgroundColor: "#333",
  },
  placeholderArtwork: {
    width: 180,
    height: 180,
    borderRadius: 16,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
  },
  contentInfo: {
    alignItems: "center",
  },
  nowPlayingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  nowPlayingShow: {
    fontSize: 16,
    color: "#ccc",
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  progressContainer: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#333",
    minWidth: 70,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  playButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    minWidth: 120,
    alignItems: "center",
  },
  playButtonActive: {
    backgroundColor: "#fff",
  },
  pauseButton: {
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  playButtonIcon: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  playButtonActiveIcon: {
    color: "#000",
  },
  pauseButtonIcon: {
    color: "#fff",
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#666",
    borderColor: "#666",
  },
  disabledButtonIcon: {
    color: "#999",
  },
  loadingButton: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.3,
  },
  loadingDot2: {
    opacity: 0.6,
  },
  loadingDot3: {
    opacity: 0.9,
  },
  errorContainer: {
    backgroundColor: "#ff4444",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#DD8210",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  retryCountText: {
    color: "#ccc",
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  updateButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignSelf: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
