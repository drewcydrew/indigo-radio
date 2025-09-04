import React, { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { RadioProgram } from "../types/types";
import radioPrograms from "../data/radioPrograms.json";
import ScheduleDisplay from "./ScheduleDisplay";
import TodaysSchedule from "./TodaysSchedule";
import LiveRadioPlayer from "./LiveRadioPlayer";

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream";

// Cast the imported JSON to the proper type with type assertion
const RADIO_PROGRAMS = radioPrograms as RadioProgram[];

interface LiveRadioProps {
  onNowPlayingUpdate: (title: string) => void;
}

export default function LiveRadio({ onNowPlayingUpdate }: LiveRadioProps) {
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

  useEffect(() => {
    playLiveRadio();
  }, []);

  return (
    <View style={styles.container}>
      {/* Live Radio Content */}
      <View style={styles.content}>
        {/* Today's Schedule Component */}
        <TodaysSchedule
          programs={RADIO_PROGRAMS}
          currentProgram={currentProgram}
          showTitle={true}
        />
      </View>

      {/* Live Radio Player - Fixed at Bottom */}
      <LiveRadioPlayer currentProgram={currentProgram} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 180, // Add padding to prevent content from being hidden behind floating player
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  radioIcon: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: "center",
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
});
