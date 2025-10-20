import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { RadioProgram, ShowDefinition } from "../types/types";
import usePrograms from "../hooks/usePrograms";
import useShowDetails from "../hooks/useShowDetails";
import { usePlayer } from "../contexts/PlayerContext";
import { audioService } from "../services/AudioService";
import useRadioAddress from "../hooks/useRadioAddress";

interface TodayProps {
  onNowPlayingUpdate: (title: string) => void;
  onGoToShow?: (showName: string) => void;
  onShowDetails?: (show: ShowDefinition) => void;
  onShowFullSchedule?: (programs: RadioProgram[]) => void;
}

export default function Today({
  onNowPlayingUpdate,
  onGoToShow,
  onShowDetails,
  onShowFullSchedule,
}: TodayProps) {
  const [currentProgram, setCurrentProgram] = useState<RadioProgram | null>(
    null
  );
  const [nextProgram, setNextProgram] = useState<RadioProgram | null>(null);
  const { setCurrentContent, setPlayerVisible } = usePlayer();
  const { radioAddress } = useRadioAddress();

  // Use hooks to get program data and show details
  const {
    programs,
    getCurrentProgram,
    loading: programsLoading,
  } = usePrograms();
  const { findShowByName } = useShowDetails();

  // Get next program function
  const getNextProgram = (): RadioProgram | null => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Get today's day name
    const dayMapping: { [key: number]: RadioProgram["day"] } = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };
    const today = dayMapping[now.getDay()];

    // Get today's programs sorted by start time
    const todaysPrograms = programs
      .filter((program) => program.day === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Find the next program after current time
    const nextProgram = todaysPrograms.find(
      (program) => program.startTime > currentTime
    );

    if (nextProgram) {
      return nextProgram;
    }

    // If no program found today, get first program of tomorrow
    const tomorrow = dayMapping[(now.getDay() + 1) % 7];
    const tomorrowsPrograms = programs
      .filter((program) => program.day === tomorrow)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return tomorrowsPrograms[0] || null;
  };

  // Update current program every minute
  useEffect(() => {
    const updateProgram = () => {
      const program = getCurrentProgram();
      const next = getNextProgram();
      setCurrentProgram(program);
      setNextProgram(next);

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
  }, [onNowPlayingUpdate, getCurrentProgram, programs]);

  const playLiveRadio = async () => {
    try {
      // Update player context first
      setCurrentContent({ type: "live", program: currentProgram });
      setPlayerVisible(true);

      // For web, set up the audio service track info
      if (Platform.OS === "web") {
        await audioService.add({
          id: "live",
          url: radioAddress,
          title: currentProgram?.name || "Indigo FM Live",
          artist: currentProgram?.host || "Live Radio",
        });
      }

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

  const handleCurrentProgramPress = () => {
    if (currentProgram) {
      const showDef = findShowByName(currentProgram.name);
      if (showDef && onShowDetails) {
        onShowDetails(showDef);
      }
    }
  };

  const handleNextProgramPress = () => {
    if (nextProgram) {
      const showDef = findShowByName(nextProgram.name);
      if (showDef && onShowDetails) {
        onShowDetails(showDef);
      }
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Get show definition for current program
  const currentShowDef = currentProgram
    ? findShowByName(currentProgram.name)
    : null;

  // Get show definition for next program
  const nextShowDef = nextProgram ? findShowByName(nextProgram.name) : null;

  // Check if next program is tomorrow
  const isNextProgramTomorrow = (): boolean => {
    if (!nextProgram) return false;

    const now = new Date();
    const dayMapping: { [key: number]: RadioProgram["day"] } = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };
    const today = dayMapping[now.getDay()];

    return nextProgram.day !== today;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Current Show Section */}
        <View style={styles.currentShowSection}>
          {programsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading current show...</Text>
            </View>
          ) : currentProgram ? (
            <TouchableOpacity
              style={styles.currentShowCard}
              onPress={handleCurrentProgramPress}
              disabled={!currentShowDef}
            >
              <View style={styles.currentShowContent}>
                {/* Show Artwork */}
                <View style={styles.artworkContainer}>
                  {currentShowDef?.artwork ? (
                    <Image
                      source={{ uri: currentShowDef.artwork }}
                      style={styles.artwork}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderArtwork}>
                      <Text style={styles.placeholderText}>LIVE</Text>
                    </View>
                  )}

                  {/* Live Indicator */}
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>

                {/* Show Info */}
                <View style={styles.showInfo}>
                  <Text style={styles.showName}>{currentProgram.name}</Text>
                  {currentProgram.host && (
                    <Text style={styles.hostName}>
                      Hosted by {currentProgram.host}
                    </Text>
                  )}
                  <Text style={styles.timeRange}>
                    {currentProgram.startTime} - {currentProgram.endTime}
                  </Text>
                  {currentShowDef?.description && (
                    <Text style={styles.showDescription} numberOfLines={2}>
                      {currentShowDef.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Play Live Radio Button - Inside the card */}
              <TouchableOpacity
                style={styles.playButtonInCard}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent triggering the card's onPress
                  playLiveRadio();
                }}
              >
                <Text style={styles.playButtonInCardText}>
                  ▶ PLAY LIVE RADIO
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <View style={styles.noShowCard}>
              <Text style={styles.noShowText}>
                No scheduled programming at this time
              </Text>
              <Text style={styles.currentTimeText}>
                Current time: {getCurrentTime()}
              </Text>

              {/* Play Live Radio Button - Also in the no show card */}
              <TouchableOpacity
                style={styles.playButtonInCard}
                onPress={playLiveRadio}
              >
                <Text style={styles.playButtonInCardText}>
                  ▶ PLAY LIVE RADIO
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Up Next Section */}
        {nextProgram && (
          <View style={styles.upNextSection}>
            <Text style={styles.upNextTitle}>
              UP NEXT {isNextProgramTomorrow() ? "TOMORROW" : ""}
            </Text>

            <TouchableOpacity
              style={styles.upNextCard}
              onPress={handleNextProgramPress}
              disabled={!nextShowDef}
            >
              <View style={styles.upNextContent}>
                {/* Next Show Artwork */}
                <View style={styles.nextArtworkContainer}>
                  {nextShowDef?.artwork ? (
                    <Image
                      source={{ uri: nextShowDef.artwork }}
                      style={styles.nextArtwork}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.nextPlaceholderArtwork}>
                      <Text style={styles.nextPlaceholderText}>NEXT</Text>
                    </View>
                  )}
                </View>

                {/* Next Show Info */}
                <View style={styles.nextShowInfo}>
                  <Text style={styles.nextShowName}>{nextProgram.name}</Text>
                  {nextProgram.host && (
                    <Text style={styles.nextHostName}>{nextProgram.host}</Text>
                  )}
                  <Text style={styles.nextTimeRange}>
                    {nextProgram.startTime} - {nextProgram.endTime}
                  </Text>
                </View>

                {/* Arrow Indicator */}
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* View Full Schedule Button */}
        {onShowFullSchedule && (
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => onShowFullSchedule(programs)}
          >
            <Text style={styles.scheduleButtonText}>VIEW FULL SCHEDULE</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
  },
  content: {
    flex: 1,
    padding: Platform.OS === "web" ? 24 : 20,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 1200 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
    minHeight: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 32,
    color: "#000",
    textAlign: "center",
  },
  currentShowSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    color: "#D5851F",
    letterSpacing: 1,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  currentShowCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  currentShowContent: {
    alignItems: "center",
  },
  artworkContainer: {
    position: "relative",
    marginBottom: 16,
  },
  artwork: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  placeholderArtwork: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#D5851F",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
  },
  liveIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff0000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  showInfo: {
    alignItems: "center",
  },
  showName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
    textAlign: "center",
  },
  hostName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  timeRange: {
    fontSize: 14,
    color: "#D5851F",
    fontWeight: "600",
    marginBottom: 12,
  },
  showDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
  noShowCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  noShowText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  currentTimeText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  playButtonInCard: {
    backgroundColor: "#D5851F",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#D5851F",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playButtonInCardText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  upNextSection: {
    marginBottom: 24,
  },
  upNextTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    color: "#666",
    letterSpacing: 1,
    textAlign: "center",
  },
  upNextCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  upNextContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextArtworkContainer: {
    marginRight: 12,
  },
  nextArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
  },
  nextPlaceholderArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  nextPlaceholderText: {
    color: "#666",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  nextShowInfo: {
    flex: 1,
    marginRight: 12,
  },
  nextShowName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  nextHostName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  nextTimeRange: {
    fontSize: 12,
    color: "#D5851F",
    fontWeight: "600",
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  arrow: {
    fontSize: 20,
    color: "#D5851F",
    fontWeight: "300",
  },
  scheduleButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#D5851F",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  scheduleButtonText: {
    color: "#D5851F",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
