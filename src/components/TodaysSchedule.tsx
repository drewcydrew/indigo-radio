import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { RadioProgram, ShowDefinition } from "../types/types";
import showDefinitions from "../data/showDefinitions.json";
import ShowDetailsModal from "./ShowDetailsModal";
import ScheduleDisplay from "./ScheduleDisplay";

const SHOW_DEFINITIONS = showDefinitions as ShowDefinition[];

interface TodaysScheduleProps {
  programs: RadioProgram[];
  currentProgram?: RadioProgram | null;
  showTitle?: boolean;
  onGoToShow?: (showName: string) => void;
}

export default function TodaysSchedule({
  programs,
  currentProgram,
  showTitle = false,
  onGoToShow,
}: TodaysScheduleProps) {
  const [selectedShow, setSelectedShow] = useState<ShowDefinition | null>(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Get today's day name
  const getTodayName = (): RadioProgram["day"] => {
    const dayMapping: { [key: number]: RadioProgram["day"] } = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };
    return dayMapping[new Date().getDay()];
  };

  // Filter programs for today and sort by start time
  const todaysPrograms = programs
    .filter((program) => program.day === getTodayName())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Function to find show definition by program name
  const findShowDefinition = (programName: string): ShowDefinition | null => {
    return (
      SHOW_DEFINITIONS.find(
        (show) =>
          show.name.toLowerCase().includes(programName.toLowerCase()) ||
          programName.toLowerCase().includes(show.name.toLowerCase()) ||
          show.showId
            .toLowerCase()
            .includes(programName.toLowerCase().replace(/\s+/g, "-"))
      ) || null
    );
  };

  const handleProgramPress = (program: RadioProgram) => {
    const showDef = findShowDefinition(program.name);
    if (showDef) {
      setSelectedShow(showDef);
    }
  };

  const hideDetails = () => {
    setSelectedShow(null);
  };

  const renderProgram = ({ item: program }: { item: RadioProgram }) => {
    const showDef = findShowDefinition(program.name);
    const isCurrentProgram = currentProgram?.id === program.id;
    const description = showDef?.description || "Radio programming";
    const artwork = showDef?.artwork;

    return (
      <TouchableOpacity
        style={[
          styles.programItem,
          isCurrentProgram && styles.currentProgramItem,
        ]}
        onPress={() => handleProgramPress(program)}
        disabled={!showDef}
      >
        <View style={styles.programContent}>
          {/* Thumbnail Image */}
          <View style={styles.thumbnailContainer}>
            {artwork ? (
              <Image
                source={{ uri: artwork }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <Text style={styles.placeholderIcon}>📻</Text>
              </View>
            )}
          </View>

          <View style={styles.programInfo}>
            <View style={styles.programTitleRow}>
              <Text
                style={[
                  styles.programTitle,
                  isCurrentProgram && styles.currentProgramTitle,
                ]}
              >
                {program.name}
              </Text>
              {isCurrentProgram && (
                <Text style={styles.liveIndicator}>🔴 LIVE</Text>
              )}
              {showDef && <Text style={styles.infoIcon}>ℹ️</Text>}
            </View>
            {program.host && (
              <Text
                style={[
                  styles.hostText,
                  isCurrentProgram && styles.currentHostText,
                ]}
              >
                with {program.host}
              </Text>
            )}
            <Text
              style={[
                styles.descriptionText,
                isCurrentProgram && styles.currentDescriptionText,
              ]}
              numberOfLines={2}
            >
              {description}
            </Text>
          </View>

          <Text
            style={[
              styles.timeText,
              isCurrentProgram && styles.currentTimeText,
            ]}
          >
            {program.startTime} - {program.endTime}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {showTitle && <Text style={styles.title}>Today's Schedule</Text>}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.fullScheduleButton}
        onPress={() => setShowFullSchedule(true)}
      >
        <Text style={styles.fullScheduleText}>📅 Show Full Schedule</Text>
      </TouchableOpacity>
    </View>
  );

  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const todayName = dayNames[getTodayName()];

  return (
    <View style={styles.container}>
      <FlatList
        data={todaysPrograms}
        renderItem={renderProgram}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <Text style={styles.noPrograms}>
            No programs scheduled for {todayName}
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Show Details Modal */}
      {selectedShow && (
        <ShowDetailsModal
          show={selectedShow}
          onClose={hideDetails}
          onGoToShow={onGoToShow}
        />
      )}

      {/* Full Schedule Modal */}
      {showFullSchedule && (
        <ScheduleDisplay
          programs={programs}
          onGoToShow={onGoToShow}
          onClose={() => setShowFullSchedule(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  programItem: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  currentProgramItem: {
    backgroundColor: "#e8f4fd",
    borderLeftColor: "#ff4444",
  },
  programContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
  },
  placeholderThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 20,
  },
  programInfo: {
    flex: 1,
    marginRight: 12,
  },
  programTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  currentProgramTitle: {
    color: "#ff4444",
  },
  liveIndicator: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoIcon: {
    fontSize: 12,
    opacity: 0.6,
  },
  hostText: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
    color: "#007AFF",
    fontWeight: "500",
  },
  currentHostText: {
    color: "#ff4444",
  },
  descriptionText: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
    lineHeight: 16,
  },
  currentDescriptionText: {
    opacity: 0.8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  currentTimeText: {
    color: "#ff4444",
  },
  noPrograms: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  footerContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  fullScheduleButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  fullScheduleText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
