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

  useEffect(() => {
    setupPlayer();
  }, []);

  const handleNowPlayingUpdate = (title: string) => {
    setNow(title);
  };

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

      {/* Floating Toggle Button */}
      <View
        style={{
          position: "absolute",
          top: 50, // Adjust based on your SafeAreaView
          right: 16,
          backgroundColor: "#007AFF",
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 8,
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
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 12 }}>
            {currentMode === "live" ? "📻 LIVE" : "🎧 PODCAST"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
