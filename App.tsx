import React, { useEffect, useState } from "react";
import { Text, View, Platform, StyleSheet } from "react-native";
import TrackPlayer, { Capability } from "react-native-track-player";
import { PlayerProvider } from "./src/contexts/PlayerContext";
import UniversalPlayer from "./src/components/UniversalPlayer";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";

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
  const [isPlayerReady, setIsPlayerReady] = useState(false);

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

  // Don't render components until player is ready
  if (!isPlayerReady) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <Text>Loading player...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <SafeAreaView
          style={[
            styles.container,
            Platform.OS === "web" && styles.webContainer,
          ]}
        >
          {/* Main Content with Navigation */}
          <View style={styles.mainContent}>
            {/* App Navigator */}
            <View style={styles.content}>
              <AppNavigator />
            </View>
          </View>

          {/* Docked Universal Player at Bottom */}
          <UniversalPlayer />
        </SafeAreaView>
      </PlayerProvider>
    </SafeAreaProvider>
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
  content: {
    flex: 1,
    minHeight: 0, // Critical for proper scrolling
    overflow: Platform.OS === "web" ? "hidden" : "visible",
  },
});
