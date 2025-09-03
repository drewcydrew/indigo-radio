import React, { useEffect } from "react";
import { View, Text, Platform } from "react-native";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import PlayingWindow from "./PlayingWindow";

// @ts-ignore
import ReactAudioPlayer from "react-audio-player";

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream";

interface LiveRadioProps {
  onNowPlayingUpdate: (title: string) => void;
}

export default function LiveRadio({ onNowPlayingUpdate }: LiveRadioProps) {
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

      {/* Playing Controls at Bottom */}
      <PlayingWindow showSkipControls={false} />
    </View>
  );
}
