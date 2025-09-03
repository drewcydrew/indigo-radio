import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, Button, View } from "react-native";
import TrackPlayer, {
  Capability,
  Event,
  usePlaybackState,
  useTrackPlayerEvents,
} from "react-native-track-player";

// 1) Register background service at module load (RNTP v4)
TrackPlayer.registerPlaybackService(
  () => require("./src/playback-service").default
);

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream"; // e.g. HLS/MP3 endpoint from a station

async function setup() {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Pause],
    android: { alwaysPauseOnInterruption: true },
  });
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: "live",
    url: STREAM_URL,
    title: "Live Radio",
    artist: "Now Playing",
    isLiveStream: true, // iOS: marks as a live stream in Control Center
  });
}

export default function App() {
  const playback = usePlaybackState();
  const [now, setNow] = useState<string>("…");

  // 2) Listen for metadata updates
  useTrackPlayerEvents(
    [Event.MetadataCommonReceived, Event.MetadataTimedReceived],
    (event) => {
      // Handle common metadata
      if (event.type === Event.MetadataCommonReceived) {
        console.log("Common metadata", event.metadata);
        const title = event.metadata.title || event.metadata.artist;
        if (title) setNow(String(title));
      }
      // Handle timed metadata (ICY metadata for streams)
      if (event.type === Event.MetadataTimedReceived) {
        // metadata is an array for timed metadata
        if (event.metadata.length > 0) {
          console.log("Timed metadata", event.metadata);
          const firstMetadata = event.metadata[0];
          if (firstMetadata.text) {
            setNow(String(firstMetadata.text));
          }
        }
      }
    }
  );

  useEffect(() => {
    setup();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Digital Radio</Text>
      <View>
        <Text style={{ fontSize: 16, opacity: 0.7 }}>Now Playing</Text>
        <Text style={{ fontSize: 20 }}>{now}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button title="Play" onPress={() => TrackPlayer.play()} />
        <Button title="Pause" onPress={() => TrackPlayer.pause()} />
        <Button title="Stop" onPress={() => TrackPlayer.stop()} />
      </View>
      <Text style={{ opacity: 0.6 }}>
        State: {String(playback?.state ?? "unknown")}
      </Text>
    </SafeAreaView>
  );
}
