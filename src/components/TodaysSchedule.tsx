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
import ScheduleDisplay from "./ScheduleDisplay";

interface TodaysScheduleProps {
  programs: RadioProgram[];
  currentProgram?: RadioProgram | null;
  showTitle?: boolean;
  onGoToShow?: (showName: string) => void;
  onShowDetails?: (show: ShowDefinition) => void;
  programsLoading?: boolean;
  hideFooterButton?: boolean;
  onShowFullSchedule?: () => void;
}

export default function TodaysSchedule({
  programs,
  currentProgram,
  showTitle = false,
  onGoToShow,
  onShowDetails,
  programsLoading = false,
  hideFooterButton = false,
  onShowFullSchedule,
}: TodaysScheduleProps) {
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
    if (showDef && onShowDetails) {
      onShowDetails(showDef);
    }
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
      {/* No action buttons needed here anymore */}
    </View>
  );

  const renderFooter = () => {
    if (hideFooterButton) {
      return (
        <View style={styles.footerContainer}>
          {onShowFullSchedule && (
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={onShowFullSchedule}
            >
              <Text style={styles.scheduleButtonText}>VIEW FULL SCHEDULE</Text>
            </TouchableOpacity>
          )}
        </View>
      );
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

      {/* Full Schedule Modal - Only render if not hidden */}
      {!hideFooterButton && showFullSchedule && (
        <ScheduleDisplay
          programs={programs}
          onGoToShow={onGoToShow}
          onShowDetails={onShowDetails}
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
    paddingBottom: 100, // Extra padding to account for player
    width: "100%",
    maxWidth: "100%",
    flexGrow: 1, // Allow content to grow but not force height
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
    color: "#FFFBE7",
  },
  programItem: {
    padding: 20,
    backgroundColor: "#008080",
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFBE7",
    marginHorizontal: Platform.OS === "web" ? 0 : 0,
    width: "100%",
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  currentProgramItem: {
    backgroundColor: "#008080",
    borderColor: "#DD8210",
    borderWidth: 3,
    shadowColor: "#DD8210",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  programContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: "100%",
  },
  thumbnailContainer: {
    marginRight: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  placeholderThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#FFFBE7",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 10,
    fontWeight: "700",
    color: "#008080",
    letterSpacing: 0.5,
  },
  programInfo: {
    flex: 1,
    marginRight: 16,
    minWidth: 0, // Important for text truncation on web
  },
  programTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  programTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFBE7",
    flexShrink: 1,
  },
  currentProgramTitle: {
    color: "#FFFBE7",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFBE7",
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFBE7",
    letterSpacing: 0.5,
  },
  hostText: {
    fontSize: 14,
    marginBottom: 6,
    color: "#e2e8f0",
    fontWeight: "500",
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  currentHostText: {
    color: "#e2e8f0",
  },
  descriptionText: {
    fontSize: 13,
    opacity: 0.8,
    fontStyle: "italic",
    lineHeight: 18,
    color: "#e2e8f0",
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
  },
  currentDescriptionText: {
    opacity: 0.9,
    color: "#e2e8f0",
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFBE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: Platform.OS === "web" ? 80 : "auto",
    textAlign: "center",
  },
  currentTimeText: {
    color: "#FFFBE7",
  },
  noPrograms: {
    textAlign: "center",
    opacity: 0.8,
    marginTop: 20,
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: "100%",
    color: "#FFFBE7",
    fontSize: 16,
  },
  footerContainer: {
    marginTop: 24,
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
    width: "100%",
    maxWidth: "100%",
  },
  fullScheduleButton: {
    backgroundColor: "#DD8210",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    maxWidth: "100%",
    shadowColor: "#DD8210",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fullScheduleText: {
    color: "#FFFBE7",
    fontSize: 15,
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
    color: "#FFFBE7",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  actionButtonsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  liveButton: {
    backgroundColor: "#DD8210",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#DD8210",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  liveButtonText: {
    color: "#FFFBE7",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  scheduleButton: {
    backgroundColor: "#DD8210",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#DD8210",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  scheduleButtonText: {
    color: "#FFFBE7",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
