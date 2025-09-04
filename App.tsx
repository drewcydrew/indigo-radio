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
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.Skip],
      // Add notification configuration for better lock screen display
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
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

  // Web implementation using React Native components
  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Indigo FM</Text>
        </View>

        {/* Toggle Switch */}
        <View style={styles.webContent}>
          <View style={styles.webToggleContainer}>
            <TouchableOpacity
              onPress={() => setCurrentMode("live")}
              style={[
                styles.webToggleButton,
                currentMode === "live"
                  ? styles.webActiveToggle
                  : styles.webInactiveToggle,
              ]}
            >
              <Text
                style={[
                  styles.webToggleText,
                  { color: currentMode === "live" ? "white" : "#666" },
                ]}
              >
                Live
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentMode("podcast")}
              style={[
                styles.webToggleButton,
                currentMode === "podcast"
                  ? styles.webActiveToggle
                  : styles.webInactiveToggle,
              ]}
            >
              <Text
                style={[
                  styles.webToggleText,
                  { color: currentMode === "podcast" ? "white" : "#666" },
                ]}
              >
                Podcast
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {currentMode === "live" ? (
            <LiveRadio
              onNowPlayingUpdate={handleNowPlayingUpdate}
              onGoToShow={handleGoToShow}
            />
          ) : (
            <Podcast
              onNowPlayingUpdate={handleNowPlayingUpdate}
              initialFilter={podcastFilter}
            />
          )}
        </View>
      </View>
    );
  }

  // Mobile implementation
  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content - Full Screen */}
      <View style={styles.mainContent}>
        {/* App Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Indigo FM</Text>
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
            />
          )}
        </View>
      </View>

      {/* Floating Toggle Switch */}
      <View style={styles.floatingToggle}>
        <TouchableOpacity
          onPress={() =>
            setCurrentMode(currentMode === "live" ? "podcast" : "live")
          }
          style={styles.toggleSwitch}
        >
          {/* Toggle Background Track */}
          <View
            style={[
              styles.toggleTrack,
              { left: currentMode === "live" ? 3 : 79 },
            ]}
          />

          {/* Radio Option */}
          <View style={styles.toggleOption}>
            <Text
              style={[
                styles.toggleText,
                { color: currentMode === "live" ? "white" : "#666" },
              ]}
            >
              Live
            </Text>
          </View>

          {/* Podcast Option */}
          <View style={styles.toggleOption}>
            <Text
              style={[
                styles.toggleText,
                { color: currentMode === "podcast" ? "white" : "#666" },
              ]}
            >
              Podcast
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  },
  webContainer: {
    backgroundColor: "#fff",
  },
  mainContent: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  webContent: {
    padding: 16,
  },
  webToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  webToggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  webActiveToggle: {
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  webInactiveToggle: {
    backgroundColor: "transparent",
  },
  webToggleText: {
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  floatingToggle: {
    position: "absolute",
    top: 50,
    right: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },
  toggleSwitch: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 2,
    width: 160,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  toggleTrack: {
    position: "absolute",
    top: 2,
    backgroundColor: "#000",
    borderRadius: 6,
    width: 78,
    height: 36,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  toggleText: {
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
