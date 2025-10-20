import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { RadioProgram, ShowDefinition } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";

type FullScheduleScreenRouteProp = RouteProp<
  RootStackParamList,
  "FullSchedule"
>;
type FullScheduleScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FullSchedule"
>;

export default function FullScheduleScreen() {
  const route = useRoute<FullScheduleScreenRouteProp>();
  const navigation = useNavigation<FullScheduleScreenNavigationProp>();
  const { programs } = route.params;

  const [selectedDay, setSelectedDay] = useState<RadioProgram["day"]>(() => {
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
  });

  // Use the hook to get show details
  const { findShowByName } = useShowDetails();

  // Function to find show definition by program name
  const findShowDefinition = (programName: string): ShowDefinition | null => {
    return findShowByName(programName);
  };

  const handleShowDetails = (show: ShowDefinition) => {
    navigation.navigate("ShowDetails", { show });
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
      <FlatList
        data={dayOrder}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.tabsContainer}
        renderItem={({ item: day }) => (
          <TouchableOpacity
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
        )}
      />
    </View>
  );

  const renderProgram = ({ item: program }: { item: RadioProgram }) => {
    const showDef = findShowDefinition(program.name);
    const description = showDef?.description || "Radio programming";
    const artwork = showDef?.artwork;

    return (
      <TouchableOpacity
        style={styles.programItem}
        onPress={() => {
          if (showDef) {
            handleShowDetails(showDef);
          }
        }}
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
              <Text style={styles.hostText}>Hosted by {program.host}</Text>
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
  };

  return (
    <View style={styles.container}>
      {/* Day Selector */}
      {renderDayTabs()}

      {/* Schedule Content */}
      <View style={styles.scheduleContent}>
        <Text style={styles.selectedDayTitle}>{dayFullNames[selectedDay]}</Text>

        {selectedDayPrograms.length === 0 ? (
          <Text style={styles.noPrograms}>
            No programs scheduled for {dayFullNames[selectedDay]}
          </Text>
        ) : (
          <FlatList
            data={selectedDayPrograms}
            renderItem={renderProgram}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.programsList}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  dayTabs: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabsContainer: {
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activeDayTab: {
    backgroundColor: "#D5851F",
    borderColor: "#D5851F",
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeDayTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  scheduleContent: {
    flex: 1,
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
  programsList: {
    paddingBottom: 20,
  },
  programItem: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 0,
    borderLeftWidth: 3,
    borderLeftColor: "#D5851F",
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
    color: "#D5851F",
  },
});
