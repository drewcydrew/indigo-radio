import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import TrackPlayer, { Capability } from "react-native-track-player";
import LiveRadio from "./src/components/LiveRadio";
import Podcast from "./src/components/Podcast";
import { PlayerProvider } from "./src/contexts/PlayerContext";
import UniversalPlayer from "./src/components/UniversalPlayer";

async function setupPlayer() {
  if (Platform.OS !== "web") {
    await TrackPlayer.setupPlayer({});
    TrackPlayer.registerPlaybackService(() => require("./service"));
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
        Capability.Skip,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
      ],
      // Add forward/backward jump intervals for podcasts
      forwardJumpInterval: 15,
      backwardJumpInterval: 15,
    });
  }
}

export default function App() {
  const [now, setNow] = useState<string>("Indigo FM");
  const [currentMode, setCurrentMode] = useState<"live" | "podcast">("live");
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [podcastFilter, setPodcastFilter] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const initializePlayer = async () => {
      try {
        console.log("Setting up player...");
        await setupPlayer();
        console.log("Player setup complete");
        setIsPlayerReady(true);
      } catch (error) {
        console.error("Error setting up player:", error);
        // On web, just set ready since no TrackPlayer setup needed
        if (Platform.OS === "web") {
          setIsPlayerReady(true);
        }
      }
    };

    initializePlayer();
  }, []);

  const handleNowPlayingUpdate = (title: string) => {
    setNow(title);
  };

  const handleGoToShow = (showName: string) => {
    setPodcastFilter(showName);
    setCurrentMode("podcast");
  };

  // Don't render components until player is ready
  if (!isPlayerReady) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading player...</Text>
      </SafeAreaView>
    );
  }

  return (
    <PlayerProvider>
      <SafeAreaView
        style={[styles.container, Platform.OS === "web" && styles.webContainer]}
      >
        {/* Main Content - Takes remaining space above player */}
        <View style={styles.mainContent}>
          {/* App Title with Toggle */}
          <View style={styles.header}>
            <Text style={styles.title}>Indigo FM</Text>

            {/* Toggle Switch in Header */}
            <View style={styles.headerToggleContainer}>
              <View style={styles.toggleSwitch}>
                {/* Radio Option */}
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    currentMode === "live" && styles.toggleOptionSelected,
                  ]}
                  onPress={() => setCurrentMode("live")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      currentMode === "live" && styles.toggleTextSelected,
                    ]}
                  >
                    Live
                  </Text>
                </TouchableOpacity>

                {/* Podcast Option */}
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    currentMode === "podcast" && styles.toggleOptionSelected,
                  ]}
                  onPress={() => setCurrentMode("podcast")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      currentMode === "podcast" && styles.toggleTextSelected,
                    ]}
                  >
                    Podcast
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Full Screen Component */}
          <View style={styles.content}>
            {currentMode === "live" ? (
              <LiveRadio
                onNowPlayingUpdate={handleNowPlayingUpdate}
                onGoToShow={handleGoToShow}
              />
            ) : (
              <Podcast
                onNowPlayingUpdate={handleNowPlayingUpdate}
                initialFilter={podcastFilter}
                onGoToShow={handleGoToShow}
              />
            )}
          </View>
        </View>

        {/* Docked Universal Player at Bottom */}
        <UniversalPlayer onGoToShow={handleGoToShow} />
      </SafeAreaView>
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    height: "100%",
  },
  webContainer: {
    backgroundColor: "#fff",
    maxWidth: "100%",
    width: "100%",
    alignSelf: "center",
  },
  mainContent: {
    flex: 1,
    minHeight: 0, // Allow content to shrink
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    maxWidth: Platform.OS === "web" ? 1200 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
    width: "100%",
    flexShrink: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: 0, // Critical for proper scrolling
    overflow: Platform.OS === "web" ? "hidden" : "visible",
  },
  headerToggleContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  toggleSwitch: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 6,
    width: 128,
    height: 32,
    borderWidth: 2,
    borderColor: "#D5851F",
    overflow: "hidden",
    padding: 0,
  },
  toggleOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    backgroundColor: "#fff",
    height: "100%",
  },
  toggleOptionSelected: {
    backgroundColor: "#D5851F",
  },
  toggleText: {
    fontWeight: "600",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#000",
  },
  toggleTextSelected: {
    color: "#fff",
  },
});
