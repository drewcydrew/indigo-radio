import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { RadioProgram, ShowDefinition } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";
import ShowDetailsModal from "./ShowDetailsModal";
import ScheduleDisplay from "./ScheduleDisplay";

interface TodaysScheduleProps {
  programs: RadioProgram[];
  currentProgram?: RadioProgram | null;
  showTitle?: boolean;
  onGoToShow?: (showName: string) => void;
  programsLoading?: boolean;
  hideFooterButton?: boolean;
}

export default function TodaysSchedule({
  programs,
  currentProgram,
  showTitle = false,
  onGoToShow,
  programsLoading = false,
  hideFooterButton = false,
}: TodaysScheduleProps) {
  const [selectedShow, setSelectedShow] = useState<ShowDefinition | null>(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Use the hook to get show details
  const { findShowByName, loading: showDetailsLoading } = useShowDetails();

  // Check if any data is still loading
  const isLoading = programsLoading || showDetailsLoading;

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
    return findShowByName(programName);
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
                <Text style={styles.placeholderIcon}>RADIO</Text>
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
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDotSmall} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
            {program.host && (
              <Text
                style={[
                  styles.hostText,
                  isCurrentProgram && styles.currentHostText,
                ]}
              >
                Hosted by {program.host}
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

  const renderFooter = () => {
    if (hideFooterButton) {
      return null;
    }

    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.fullScheduleButton}
          onPress={() => setShowFullSchedule(true)}
        >
          <Text style={styles.fullScheduleText}>VIEW FULL SCHEDULE</Text>
        </TouchableOpacity>
      </View>
    );
  };

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

  // Loading component
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.loadingText}>Loading today's schedule...</Text>
    </View>
  );

  // If loading, show loading indicator
  if (isLoading) {
    return (
      <View style={styles.container}>
        {showTitle && (
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Today's Schedule</Text>
          </View>
        )}
        {renderLoading()}
      </View>
    );
  }

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

      {/* Full Schedule Modal - Only render if not hidden */}
      {!hideFooterButton && showFullSchedule && (
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
    width: "100%",
    maxWidth: "100%",
    minHeight: 0, // Allow container to shrink
  },
  listContent: {
    paddingBottom: 20,
    width: "100%",
    maxWidth: "100%",
    flexGrow: 1, // Allow content to grow but not force height
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
  },
  programItem: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    marginBottom: 8,
    borderRadius: 0,
    borderLeftWidth: 3,
    borderLeftColor: "#000",
    marginHorizontal: Platform.OS === "web" ? 0 : 0,
    width: "100%",
    maxWidth: "100%",
  },
  currentProgramItem: {
    backgroundColor: "#000",
    borderLeftColor: "#fff",
  },
  programContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: "100%",
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
    borderRadius: 0,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 8,
    fontWeight: "700",
    color: "#666",
    letterSpacing: 0.5,
  },
  programInfo: {
    flex: 1,
    marginRight: 12,
    minWidth: 0, // Important for text truncation on web
  },
  programTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    flexShrink: 1,
  },
  currentProgramTitle: {
    color: "#fff",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff0000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  hostText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
    fontWeight: "500",
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  currentHostText: {
    color: "#ccc",
  },
  descriptionText: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
    lineHeight: 16,
    color: "#000",
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  currentDescriptionText: {
    opacity: 0.8,
    color: "#fff",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    minWidth: Platform.OS === "web" ? 80 : "auto",
    textAlign: "right",
  },
  currentTimeText: {
    color: "#fff",
  },
  noPrograms: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: 20,
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: "100%",
  },
  footerContainer: {
    marginTop: 16,
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
    width: "100%",
    maxWidth: "100%",
  },
  fullScheduleButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0,
    alignItems: "center",
    borderWidth: 0,
    width: "100%",
    maxWidth: "100%",
  },
  fullScheduleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerContainer: {
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
    paddingBottom: 16,
    width: "100%",
    maxWidth: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    width: "100%",
    maxWidth: "100%",
    minHeight: Platform.OS === "web" ? 200 : "auto", // Minimum height for web
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
