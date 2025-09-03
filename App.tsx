import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, TouchableOpacity } from "react-native";
import TrackPlayer, { Capability } from "react-native-track-player";
import LiveRadio from "./src/components/LiveRadio";
import Podcast from "./src/components/Podcast";

// 1) Register background service at module load (RNTP v4)
TrackPlayer.registerPlaybackService(
  () => require("./src/playback-service").default
);

async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
    android: { alwaysPauseOnInterruption: true },
  });
}

export default function App() {
  const [now, setNow] = useState<string>("Indigo FM");
  const [currentMode, setCurrentMode] = useState<"live" | "podcast">("live");
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
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading player...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Main Content - Full Screen */}
      <View style={{ flex: 1 }}>
        {/* App Title */}
        <View style={{ padding: 16, paddingTop: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 8 }}>
            Indigo FM
          </Text>
          <Text style={{ fontSize: 16, opacity: 0.7 }}>Now Playing</Text>
          <Text style={{ fontSize: 18, marginBottom: 16 }}>{now}</Text>
        </View>

        {/* Full Screen Component */}
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {currentMode === "live" ? (
            <LiveRadio onNowPlayingUpdate={handleNowPlayingUpdate} />
          ) : (
            <Podcast onNowPlayingUpdate={handleNowPlayingUpdate} />
          )}
        </View>
      </View>

      {/* Floating Toggle Switch */}
      <View
        style={{
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
        }}
      >
        <TouchableOpacity
          onPress={() =>
            setCurrentMode(currentMode === "live" ? "podcast" : "live")
          }
          style={{
            flexDirection: "row",
            backgroundColor: "#f0f0f0",
            borderRadius: 25,
            padding: 3,
            width: 120,
            height: 36,
          }}
        >
          {/* Toggle Background Track */}
          <View
            style={{
              position: "absolute",
              top: 3,
              left: currentMode === "live" ? 3 : 63,
              backgroundColor: "#007AFF",
              borderRadius: 22,
              width: 57,
              height: 30,
            }}
          />

          {/* Radio Option */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Text
              style={{
                color: currentMode === "live" ? "white" : "#666",
                fontWeight: "600",
                fontSize: 11,
              }}
            >
              📻 LIVE
            </Text>
          </View>

          {/* Podcast Option */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Text
              style={{
                color: currentMode === "podcast" ? "white" : "#666",
                fontWeight: "600",
                fontSize: 11,
              }}
            >
              🎧 POD
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
