import React, { useEffect, useState } from "react";
import { View, Text, Platform, Button } from "react-native";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
  usePlaybackState,
  State,
} from "react-native-track-player";
import { RadioProgram } from "../types/types";
import radioPrograms from "../data/radioPrograms.json";
import ScheduleDisplay from "./ScheduleDisplay";

// @ts-ignore
import ReactAudioPlayer from "react-audio-player";

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream";

// Cast the imported JSON to the proper type with type assertion
const RADIO_PROGRAMS = radioPrograms as RadioProgram[];

interface LiveRadioProps {
  onNowPlayingUpdate: (title: string) => void;
}

export default function LiveRadio({ onNowPlayingUpdate }: LiveRadioProps) {
  const playback = usePlaybackState();
  const [currentProgram, setCurrentProgram] = useState<RadioProgram | null>(
    null
  );

  // Function to get current program based on day and time
  const getCurrentProgram = (): RadioProgram | null => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Get HH:MM format

    // Map JavaScript day names to our format
    const dayMapping: { [key: number]: RadioProgram["day"] } = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };

    const dayName = dayMapping[now.getDay()];

    // Find programs for today
    const todaysPrograms = RADIO_PROGRAMS.filter(
      (program) => program.day === dayName
    );

    // Find current program
    const currentProgram = todaysPrograms.find((program) => {
      const startTime = program.startTime;
      const endTime = program.endTime;

      // Handle programs that go past midnight
      if (endTime < startTime) {
        return currentTime >= startTime || currentTime <= endTime;
      }

      return currentTime >= startTime && currentTime <= endTime;
    });

    return currentProgram || null;
  };

  // Update current program every minute
  useEffect(() => {
    const updateProgram = () => {
      const program = getCurrentProgram();
      setCurrentProgram(program);

      if (program) {
        onNowPlayingUpdate(`${program.name} - ${program.host || "Indigo FM"}`);
      } else {
        onNowPlayingUpdate("Indigo FM - Live Radio");
      }
    };

    // Update immediately
    updateProgram();

    // Update every minute
    const interval = setInterval(updateProgram, 60000);

    return () => clearInterval(interval);
  }, [onNowPlayingUpdate]);

  // Only use track player events on mobile
  if (Platform.OS !== "web") {
    useTrackPlayerEvents(
      [Event.MetadataCommonReceived, Event.MetadataTimedReceived],
      (event) => {
        if (event.type === Event.MetadataCommonReceived) {
          const title = event.metadata.title || event.metadata.artist;
          if (title && title.trim() !== "" && title !== "no name") {
            // Don't override program information with metadata
            console.log("Stream metadata:", title);
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

        {/* Current Program Info */}
        {currentProgram ? (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
              {currentProgram.name}
            </h3>
            {currentProgram.host && (
              <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 4 }}>
                with {currentProgram.host}
              </p>
            )}
            <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>
              {currentProgram.startTime} - {currentProgram.endTime}
            </p>
            <p style={{ fontSize: 14, opacity: 0.6, fontStyle: "italic" }}>
              {currentProgram.description}
            </p>
          </div>
        ) : (
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
        )}

        <ReactAudioPlayer src={STREAM_URL} controls autoPlay />

        {/* Schedule Display Component */}
        <ScheduleDisplay programs={RADIO_PROGRAMS} />
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
          paddingHorizontal: 20,
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

        {/* Current Program Info */}
        {currentProgram ? (
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              {currentProgram.name}
            </Text>
            {currentProgram.host && (
              <Text
                style={{
                  fontSize: 16,
                  opacity: 0.8,
                  marginBottom: 4,
                  textAlign: "center",
                }}
              >
                with {currentProgram.host}
              </Text>
            )}
            <Text
              style={{
                fontSize: 14,
                opacity: 0.7,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {currentProgram.startTime} - {currentProgram.endTime}
            </Text>
            <Text
              style={{
                fontSize: 14,
                opacity: 0.6,
                fontStyle: "italic",
                textAlign: "center",
                paddingHorizontal: 20,
              }}
            >
              {currentProgram.description}
            </Text>
          </View>
        ) : (
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
        )}

        {/* Schedule Display Component */}
        <ScheduleDisplay programs={RADIO_PROGRAMS} />
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
