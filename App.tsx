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
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
  }
}

export default function App() {
  const [now, setNow] = useState<string>("Indigo FM");
  const [currentMode, setCurrentMode] = useState<"live" | "podcast">("podcast");
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

  const handleNowPlayingUpdate = (title: string) => {
    setNow(title);
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
                📻 LIVE
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
                🎧 POD
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {currentMode === "live" ? (
            <LiveRadio onNowPlayingUpdate={handleNowPlayingUpdate} />
          ) : (
            <Podcast onNowPlayingUpdate={handleNowPlayingUpdate} />
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
            <LiveRadio onNowPlayingUpdate={handleNowPlayingUpdate} />
          ) : (
            <Podcast onNowPlayingUpdate={handleNowPlayingUpdate} />
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
              { left: currentMode === "live" ? 3 : 63 },
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
              📻 LIVE
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
              🎧 POD
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
    gap: 8,
    marginBottom: 20,
  },
  webToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  webActiveToggle: {
    backgroundColor: "#007AFF",
  },
  webInactiveToggle: {
    backgroundColor: "#f0f0f0",
  },
  webToggleText: {
    fontWeight: "600",
    fontSize: 14,
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  toggleSwitch: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 3,
    width: 120,
    height: 36,
  },
  toggleTrack: {
    position: "absolute",
    top: 3,
    backgroundColor: "#007AFF",
    borderRadius: 22,
    width: 57,
    height: 30,
  },
  toggleOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  toggleText: {
    fontWeight: "600",
    fontSize: 11,
  },
});
