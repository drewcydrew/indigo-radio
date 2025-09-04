import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { RadioProgram, ShowDefinition } from "../types/types";
import showDefinitions from "../data/showDefinitions.json";
import ShowDetailsModal from "./ShowDetailsModal";

// Cast the imported JSON to the proper type
const SHOW_DEFINITIONS = showDefinitions as ShowDefinition[];

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

  const dayOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

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
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Program Schedule</Text>
              <TouchableOpacity onPress={hideSchedule}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              {dayOrder.map(
                (day) =>
                  programsByDay[day] && (
                    <View key={day} style={styles.daySection}>
                      <Text style={styles.dayTitle}>
                        {dayNames[day as keyof typeof dayNames]}
                      </Text>
                      {programsByDay[day].map((program) => {
                        const showDef = findShowDefinition(program.name);
                        const description =
                          showDef?.description || "Radio programming";
                        return (
                          <TouchableOpacity
                            key={program.id}
                            onPress={() => showDef && showDetails(showDef)}
                            style={[
                              styles.programCard,
                              { opacity: showDef ? 1 : 0.8 },
                            ]}
                            disabled={!showDef}
                          >
                            <View style={styles.programContent}>
                              <View style={styles.programLeft}>
                                <View style={styles.programTitleRow}>
                                  <Text style={styles.programTitle}>
                                    {program.name}
                                  </Text>
                                  {showDef && (
                                    <Text style={styles.infoIcon}>ℹ️</Text>
                                  )}
                                </View>
                                {program.host && (
                                  <Text style={styles.hostText}>
                                    with {program.host}
                                  </Text>
                                )}
                                <Text style={styles.descriptionText}>
                                  {description}
                                </Text>
                              </View>
                              <Text style={styles.timeText}>
                                {program.startTime} - {program.endTime}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )
              )}
            </ScrollView>
          </View>
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
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Program Schedule</Text>
            <TouchableOpacity onPress={hideSchedule}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {dayOrder.map(
              (day) =>
                programsByDay[day] && (
                  <View key={day} style={styles.daySection}>
                    <Text style={styles.dayTitle}>
                      {dayNames[day as keyof typeof dayNames]}
                    </Text>
                    {programsByDay[day].map((program) => {
                      const showDef = findShowDefinition(program.name);
                      const description =
                        showDef?.description || "Radio programming";
                      return (
                        <TouchableOpacity
                          key={program.id}
                          onPress={() => showDef && showDetails(showDef)}
                          style={[
                            styles.programCard,
                            { opacity: showDef ? 1 : 0.8 },
                          ]}
                          disabled={!showDef}
                        >
                          <View style={styles.programContent}>
                            <View style={styles.programLeft}>
                              <View style={styles.programTitleRow}>
                                <Text style={styles.programTitle}>
                                  {program.name}
                                </Text>
                                {showDef && (
                                  <Text style={styles.infoIcon}>ℹ️</Text>
                                )}
                              </View>
                              {program.host && (
                                <Text style={styles.hostText}>
                                  with {program.host}
                                </Text>
                              )}
                              <Text style={styles.descriptionText}>
                                {description}
                              </Text>
                            </View>
                            <Text style={styles.timeText}>
                              {program.startTime} - {program.endTime}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )
            )}
          </ScrollView>
        </View>
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
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  doneButton: {
    fontSize: 18,
    color: "#007AFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#007AFF",
  },
  programCard: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  programContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  programLeft: {
    flex: 1,
    marginRight: 12,
  },
  programTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoIcon: {
    fontSize: 12,
    opacity: 0.6,
  },
  hostText: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.6,
    fontStyle: "italic",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
});
