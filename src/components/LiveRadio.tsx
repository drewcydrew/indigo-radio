import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { RadioProgram } from "../types/types";
import usePrograms from "../hooks/usePrograms";
import TodaysSchedule from "./TodaysSchedule";
import { usePlayer } from "../contexts/PlayerContext";
import { audioService } from "../services/AudioService";

const STREAM_URL = "https://internetradio.indigofm.au:8032/stream";

interface LiveRadioProps {
  onNowPlayingUpdate: (title: string) => void;
  onGoToShow?: (showName: string) => void;
}

export default function LiveRadio({
  onNowPlayingUpdate,
  onGoToShow,
}: LiveRadioProps) {
  const [currentProgram, setCurrentProgram] = useState<RadioProgram | null>(
    null
  );
  const { setCurrentContent, setPlayerVisible } = usePlayer();

  // Use the hook to get program data
  const {
    programs,
    getCurrentProgram,
    loading: programsLoading,
  } = usePrograms();

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
  }, [onNowPlayingUpdate, getCurrentProgram]);

  // Only use track player events on mobile
  if (Platform.OS !== "web") {
    useTrackPlayerEvents(
      [Event.MetadataCommonReceived, Event.MetadataTimedReceived],
      (event) => {
        if (event.type === Event.MetadataCommonReceived) {
          const title = event.metadata.title || event.metadata.artist;
          if (title && title.trim() !== "" && title !== "no name") {
            console.log("Stream metadata:", title);
          }
        }
      }
    );
  }

  const playLiveRadio = async () => {
    try {
      // Update player context first - UniversalPlayer will handle TrackPlayer setup
      setCurrentContent({ type: "live", program: currentProgram });
      setPlayerVisible(true);

      // For web, set up the audio service track info
      if (Platform.OS === "web") {
        await audioService.add({
          id: "live",
          url: STREAM_URL,
          title: currentProgram?.name || "Indigo FM Live",
          artist: currentProgram?.host || "Live Radio",
        });
      }
      // Note: TrackPlayer setup now handled by UniversalPlayer

      // Update app state
      if (currentProgram) {
        onNowPlayingUpdate(
          `${currentProgram.name} - ${currentProgram.host || "Indigo FM"}`
        );
      } else {
        onNowPlayingUpdate("Indigo FM - Live Radio");
      }
    } catch (error) {
      console.error("Error playing live radio:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Live Radio Content */}
      <View style={styles.content}>
        {/* Play Live Radio Button */}
        <View style={styles.liveButtonContainer}>
          <TouchableOpacity style={styles.liveButton} onPress={playLiveRadio}>
            <Text style={styles.liveButtonText}>▶ PLAY LIVE RADIO</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Schedule Component */}
        <TodaysSchedule
          programs={programs}
          currentProgram={currentProgram}
          showTitle={true}
          onGoToShow={onGoToShow}
          programsLoading={programsLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 120, // Keep padding for player space
    width: "100%",
    maxWidth: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: Platform.OS === "web" ? 0 : 20,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 1200 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
    minHeight: 0,
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
  liveButtonContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  liveButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  liveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
