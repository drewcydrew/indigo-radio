import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { RadioProgram, ShowDefinition } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";
import ShowDetailsModal from "./ShowDetailsModal";

interface ScheduleDisplayProps {
  programs: RadioProgram[];
  onGoToShow?: (showName: string) => void;
  onClose?: () => void;
}

export default function ScheduleDisplay({
  programs,
  onGoToShow,
  onClose,
}: ScheduleDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedShow, setSelectedShow] = useState<ShowDefinition | null>(null);
  const [selectedDay, setSelectedDay] = useState<RadioProgram["day"]>("monday");

  // Use the hook to get show details
  const { findShowByName } = useShowDetails();

  const showSchedule = () => setIsVisible(true);
  const hideSchedule = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };
  const showDetails = (show: ShowDefinition) => setSelectedShow(show);
  const hideDetails = () => setSelectedShow(null);

  // Function to find show definition by program name
  const findShowDefinition = (programName: string): ShowDefinition | null => {
    return findShowByName(programName);
  };

  // Group programs by day
  const programsByDay = programs.reduce((acc, program) => {
    if (!acc[program.day]) {
      acc[program.day] = [];
    }
    acc[program.day].push(program);
    return acc;
  }, {} as { [key: string]: RadioProgram[] });

  // Sort programs by start time within each day
  Object.keys(programsByDay).forEach((day) => {
    programsByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const dayOrder: RadioProgram["day"][] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const dayNames = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  const dayFullNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  // Get programs for selected day
  const selectedDayPrograms = programsByDay[selectedDay] || [];

  const renderDayTabs = () => (
    <View style={styles.dayTabs}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {dayOrder.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayTab, selectedDay === day && styles.activeDayTab]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayTabText,
                selectedDay === day && styles.activeDayTabText,
              ]}
            >
              {dayNames[day]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderScheduleContent = () => (
    <View style={styles.modalContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Program Schedule</Text>
        <TouchableOpacity onPress={hideSchedule}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>

      {renderDayTabs()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.selectedDayTitle}>{dayFullNames[selectedDay]}</Text>

        {selectedDayPrograms.length === 0 ? (
          <Text style={styles.noPrograms}>
            No programs scheduled for {dayFullNames[selectedDay]}
          </Text>
        ) : (
          selectedDayPrograms.map((program) => {
            const showDef = findShowDefinition(program.name);
            const description = showDef?.description || "Radio programming";
            const artwork = showDef?.artwork;

            return (
              <TouchableOpacity
                key={program.id}
                onPress={() => showDef && showDetails(showDef)}
                style={styles.programItem}
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
                      <Text style={styles.programTitle}>{program.name}</Text>
                    </View>
                    {program.host && (
                      <Text style={styles.hostText}>
                        Hosted by {program.host}
                      </Text>
                    )}
                    <Text style={styles.descriptionText} numberOfLines={2}>
                      {description}
                    </Text>
                  </View>

                  <Text style={styles.timeText}>
                    {program.startTime} - {program.endTime}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  // If onClose is provided, show modal immediately (used by TodaysSchedule)
  if (onClose) {
    return (
      <>
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={hideSchedule}
        >
          {renderScheduleContent()}
        </Modal>

        {selectedShow && (
          <ShowDetailsModal
            show={selectedShow}
            onClose={hideDetails}
            onGoToShow={onGoToShow}
          />
        )}
      </>
    );
  }

  // Original implementation for button-triggered modal
  return (
    <>
      <View style={styles.buttonContainer}>
        <Button title="Show Schedule" onPress={showSchedule} />
      </View>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={hideSchedule}
      >
        {renderScheduleContent()}
      </Modal>

      {selectedShow && (
        <ShowDetailsModal
          show={selectedShow}
          onClose={hideDetails}
          onGoToShow={onGoToShow}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  doneButton: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#000",
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dayTabs: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    marginRight: 8,
  },
  activeDayTab: {
    backgroundColor: "#000",
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeDayTabText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  noPrograms: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  programItem: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    marginBottom: 8,
    borderRadius: 0,
    borderLeftWidth: 3,
    borderLeftColor: "#000",
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
  },
  programTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  hostText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
    lineHeight: 16,
    color: "#000",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
});
