import React, { useEffect } from "react";
import { View, Text, Platform, Button } from "react-native";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
  usePlaybackState,
  State,
} from "react-native-track-player";

// @ts-ignore
import ReactAudioPlayer from "react-audio-player";

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream";

interface LiveRadioProps {
  onNowPlayingUpdate: (title: string) => void;
}

export default function LiveRadio({ onNowPlayingUpdate }: LiveRadioProps) {
  const playback = usePlaybackState();

  // Only use track player events on mobile
  if (Platform.OS !== "web") {
    useTrackPlayerEvents(
      [Event.MetadataCommonReceived, Event.MetadataTimedReceived],
      (event) => {
        if (event.type === Event.MetadataCommonReceived) {
          const title = event.metadata.title || event.metadata.artist;
          if (title && title.trim() !== "" && title !== "no name") {
            onNowPlayingUpdate(String(title));
          }
        }
      }
    );
  }

  const playLiveRadio = async () => {
    if (Platform.OS !== "web") {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: "live",
        url: STREAM_URL,
        title: "Indigo FM Live",
        artist: "Live Radio",
        isLiveStream: true,
      });
      await TrackPlayer.play();
    }
    onNowPlayingUpdate("Indigo FM - Live Radio");
  };

  const togglePlayPause = async () => {
    if (Platform.OS === "web") return;

    const isPlaying = playback.state === State.Playing;
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  useEffect(() => {
    playLiveRadio();
  }, []);

  // Web implementation
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 20,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>📻</div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Live Radio
        </h2>
        <p
          style={{
            fontSize: 16,
            opacity: 0.7,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Streaming live from Indigo FM
        </p>
        <ReactAudioPlayer src={STREAM_URL} controls autoPlay />
      </div>
    );
  }

  // Mobile implementation
  const isPlaying = playback.state === State.Playing;

  return (
    <View style={{ flex: 1 }}>
      {/* Live Radio Content */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📻</Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Live Radio
        </Text>
        <Text
          style={{
            fontSize: 16,
            opacity: 0.7,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Streaming live from Indigo FM
        </Text>
      </View>

      {/* Live Radio Controls (Play/Pause only) */}
      <View style={{ marginBottom: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Button
            title={isPlaying ? "Pause" : "Play"}
            onPress={togglePlayPause}
          />
        </View>

        <Text style={{ opacity: 0.6, textAlign: "center" }}>
          State: {String(playback?.state ?? "unknown")}
        </Text>
      </View>
    </View>
  );
}
