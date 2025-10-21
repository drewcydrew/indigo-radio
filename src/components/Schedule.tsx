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
import { RadioProgram, ShowDefinition } from "../types/types";
import usePrograms from "../hooks/usePrograms";
import TodaysSchedule from "./TodaysSchedule";
import { usePlayer } from "../contexts/PlayerContext";
import { audioService } from "../services/AudioService";
import useRadioAddress from "../hooks/useRadioAddress";

interface ScheduleProps {
  onNowPlayingUpdate: (title: string) => void;
  onGoToShow?: (showName: string) => void;
  onShowDetails?: (show: ShowDefinition) => void;
  onShowFullSchedule?: (programs: RadioProgram[]) => void;
}

export default function Schedule({
  onNowPlayingUpdate,
  onGoToShow,
  onShowDetails,
  onShowFullSchedule,
}: ScheduleProps) {
  const [currentProgram, setCurrentProgram] = useState<RadioProgram | null>(
    null
  );
  const { setCurrentContent, setPlayerVisible } = usePlayer();

  // Use the radio address hook
  const { radioAddress } = useRadioAddress();

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
          url: radioAddress, // Use the dynamic radio address
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

  const handleShowFullSchedule = () => {
    if (onShowFullSchedule) {
      onShowFullSchedule(programs);
    }
  };

  return (
    <View style={styles.container}>
      {/* Live Radio Content */}
      <View style={styles.content}>
        {/* Today's Schedule Component - Now includes buttons in header */}
        <View style={styles.scheduleContainer}>
          <TodaysSchedule
            programs={programs}
            currentProgram={currentProgram}
            showTitle={true}
            onGoToShow={onGoToShow}
            onShowDetails={onShowDetails}
            programsLoading={programsLoading}
            hideFooterButton={true}
            onShowFullSchedule={handleShowFullSchedule}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
    backgroundColor: "#008080",
  },
  content: {
    flex: 1,
    paddingHorizontal: Platform.OS === "web" ? 32 : 24,
    paddingTop: Platform.OS === "web" ? 32 : 24,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 1200 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
    minHeight: 0,
  },
  scheduleContainer: {
    flex: 1,
    minHeight: 0, // Important for proper scrolling
  },
});
