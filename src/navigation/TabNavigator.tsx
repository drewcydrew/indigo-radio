import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./AppNavigator";
import LiveRadio from "../components/LiveRadio";
import Podcast from "../components/Podcast";
import Today from "../components/Today";
import { ShowDefinition } from "../types/types";

type TabNavigatorNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;
type TabType = "today" | "live" | "podcast";

interface TabNavigatorProps {}

export default function TabNavigator({}: TabNavigatorProps) {
  const navigation = useNavigation<TabNavigatorNavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>("today");
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

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "today" && styles.activeTab]}
          onPress={() => setActiveTab("today")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "today" && styles.activeTabText,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "live" && styles.activeTab]}
          onPress={() => setActiveTab("live")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "live" && styles.activeTabText,
            ]}
          >
            Live Radio
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
        {activeTab === "today" && (
          <Today
            onNowPlayingUpdate={handleNowPlayingUpdate}
            onGoToShow={handleGoToShow}
            onShowDetails={handleShowDetails}
          />
        )}

        {activeTab === "live" && (
          <LiveRadio
            onNowPlayingUpdate={handleNowPlayingUpdate}
            onGoToShow={handleGoToShow}
            onShowDetails={handleShowDetails}
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
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: Platform.OS === "web" ? 24 : 16,
    marginBottom: 16,
    padding: 4,
    maxWidth: Platform.OS === "web" ? 1200 : "100%",
    alignSelf: Platform.OS === "web" ? "center" : "auto",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    minHeight: 0, // Important for proper scrolling
  },
});
