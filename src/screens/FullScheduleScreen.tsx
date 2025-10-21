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
    backgroundColor: "#008080",
  },
  dayTabs: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#FFFBE7",
  },
  tabsContainer: {
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#008080",
    borderWidth: 2,
    borderColor: "#FFFBE7",
  },
  activeDayTab: {
    backgroundColor: "#DD8210",
    borderColor: "#DD8210",
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFBE7",
  },
  activeDayTabText: {
    color: "#FFFBE7",
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
    color: "#FFFBE7",
  },
  noPrograms: {
    textAlign: "center",
    opacity: 0.8,
    marginTop: 20,
    fontSize: 16,
    color: "#FFFBE7",
  },
  programsList: {
    paddingBottom: 20,
  },
  programItem: {
    padding: 20,
    backgroundColor: "#008080",
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFBE7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  programContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  },
  programTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  programTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFBE7",
  },
  hostText: {
    fontSize: 14,
    marginBottom: 6,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 13,
    opacity: 0.8,
    fontStyle: "italic",
    lineHeight: 18,
    color: "#e2e8f0",
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFBE7",
    textAlign: "center",
  },
});
