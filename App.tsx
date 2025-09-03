import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Platform,
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
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading player...</Text>
      </SafeAreaView>
    );
  }

  // Web implementation
  if (Platform.OS === "web") {
    return (
      <div style={{ minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
        {/* Header */}
        <div style={{ padding: 16, paddingTop: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
            Indigo FM
          </h1>
          <p style={{ fontSize: 16, opacity: 0.7, margin: 0 }}>Now Playing</p>
          <p style={{ fontSize: 18, marginBottom: 16 }}>{now}</p>
        </div>

        {/* Toggle Switch */}
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              onClick={() => setCurrentMode("live")}
              style={{
                padding: "8px 16px",
                backgroundColor: currentMode === "live" ? "#007AFF" : "#f0f0f0",
                color: currentMode === "live" ? "white" : "#666",
                border: "none",
                borderRadius: 20,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📻 LIVE
            </button>
            <button
              onClick={() => setCurrentMode("podcast")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  currentMode === "podcast" ? "#007AFF" : "#f0f0f0",
                color: currentMode === "podcast" ? "white" : "#666",
                border: "none",
                borderRadius: 20,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🎧 POD
            </button>
          </div>

          {/* Content */}
          {currentMode === "live" ? (
            <LiveRadio onNowPlayingUpdate={handleNowPlayingUpdate} />
          ) : (
            <Podcast onNowPlayingUpdate={handleNowPlayingUpdate} />
          )}
        </div>
      </div>
    );
  }

  // Mobile implementation
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
