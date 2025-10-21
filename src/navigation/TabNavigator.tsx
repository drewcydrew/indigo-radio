import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./AppNavigator";
import Schedule from "../components/Schedule";
import Podcast from "../components/Podcast";
import Radio from "../components/Radio";
import { ShowDefinition, RadioProgram } from "../types/types";

type TabNavigatorNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;
type TabType = "radio" | "schedule" | "podcast";

interface TabNavigatorProps {}

export default function TabNavigator({}: TabNavigatorProps) {
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>("radio");
  const [nowPlaying, setNowPlaying] = useState<string>("Indigo FM");

  const handleNowPlayingUpdate = (title: string) => {
    setNowPlaying(title);
  };

  const handleGoToShow = (showName: string) => {
    // Switch to podcast tab and filter by show
    setActiveTab("podcast");
    // The Podcast component will handle the filtering via initialFilter prop
  };

  const handleShowDetails = (show: ShowDefinition) => {
    navigation.navigate("ShowDetails", { show });
  };

  const handleShowFullSchedule = (programs: RadioProgram[]) => {
    navigation.navigate("FullSchedule", { programs });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#008080"
        barStyle="light-content"
        translucent={false}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "radio" && styles.activeTab]}
          onPress={() => setActiveTab("radio")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "radio" && styles.activeTabText,
            ]}
          >
            Radio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "schedule" && styles.activeTab]}
          onPress={() => setActiveTab("schedule")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "schedule" && styles.activeTabText,
            ]}
          >
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "podcast" && styles.activeTab]}
          onPress={() => setActiveTab("podcast")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "podcast" && styles.activeTabText,
            ]}
          >
            Podcasts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === "radio" && (
          <Radio
            onNowPlayingUpdate={handleNowPlayingUpdate}
            onGoToShow={handleGoToShow}
            onShowDetails={handleShowDetails}
          />
        )}

        {activeTab === "schedule" && (
          <Schedule
            onNowPlayingUpdate={handleNowPlayingUpdate}
            onGoToShow={handleGoToShow}
            onShowDetails={handleShowDetails}
            onShowFullSchedule={handleShowFullSchedule}
          />
        )}

        {activeTab === "podcast" && (
          <Podcast
            onNowPlayingUpdate={handleNowPlayingUpdate}
            onGoToShow={handleGoToShow}
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#008080",
    paddingTop: Platform.OS === "web" ? 24 : 48,
    paddingHorizontal: Platform.OS === "web" ? 24 : 16,
    paddingBottom: 0,
    maxWidth: Platform.OS === "web" ? 1200 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
    borderBottomWidth: 2,
    borderBottomColor: "#FFFBE7",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#DD8210",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e2e8f0",
  },
  activeTabText: {
    color: "#FFFBE7",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    minHeight: 0, // Important for proper scrolling
  },
});
