import React, { useEffect, useState } from "react";
import { View, Text, Platform, Button, StyleSheet } from "react-native";
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

  // Web audio player component
  const WebAudioPlayer = () => {
    if (Platform.OS !== "web") return null;

    return (
      <View style={styles.audioPlayerContainer}>
        <ReactAudioPlayer src={STREAM_URL} controls autoPlay />
      </View>
    );
  };

  const isPlaying =
    Platform.OS === "web" ? false : playback.state === State.Playing;

  return (
    <View style={styles.container}>
      {/* Live Radio Content */}
      <View style={styles.content}>
        <Text style={styles.radioIcon}>📻</Text>
        <Text style={styles.title}>Live Radio</Text>

        {/* Current Program Info */}
        {currentProgram ? (
          <View style={styles.programInfo}>
            <Text style={styles.programTitle}>{currentProgram.name}</Text>
            {currentProgram.host && (
              <Text style={styles.hostText}>with {currentProgram.host}</Text>
            )}
            <Text style={styles.timeText}>
              {currentProgram.startTime} - {currentProgram.endTime}
            </Text>
            <Text style={styles.descriptionText}>
              {currentProgram.description}
            </Text>
          </View>
        ) : (
          <Text style={styles.defaultText}>Streaming live from Indigo FM</Text>
        )}

        {/* Web Audio Player */}
        <WebAudioPlayer />

        {/* Schedule Display Component */}
        <ScheduleDisplay programs={RADIO_PROGRAMS} />
      </View>

      {/* Live Radio Controls (Play/Pause only) - Mobile only */}
      {Platform.OS !== "web" && (
        <View style={styles.controls}>
          <View style={styles.buttonContainer}>
            <Button
              title={isPlaying ? "Pause" : "Play"}
              onPress={togglePlayPause}
            />
          </View>

          <Text style={styles.stateText}>
            State: {String(playback?.state ?? "unknown")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  radioIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  programInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  hostText: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 4,
    textAlign: "center",
  },
  timeText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  defaultText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 32,
  },
  audioPlayerContainer: {
    marginVertical: 20,
    width: "100%",
    alignItems: "center",
  },
  controls: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  stateText: {
    opacity: 0.6,
    textAlign: "center",
  },
});
