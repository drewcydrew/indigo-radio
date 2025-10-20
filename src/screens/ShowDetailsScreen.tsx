import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ShowDefinition } from "../types/types";
import usePodcastEpisodes from "../hooks/usePodcastEpisodes";

type ShowDetailsScreenRouteProp = RouteProp<RootStackParamList, "ShowDetails">;
type ShowDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ShowDetails"
>;

interface ShowDetailsScreenProps {
  onGoToShow?: (showName: string) => void;
}

export default function ShowDetailsScreen({
  onGoToShow,
}: ShowDetailsScreenProps) {
  const route = useRoute<ShowDetailsScreenRouteProp>();
  const navigation = useNavigation<ShowDetailsScreenNavigationProp>();
  const { show } = route.params;

  const hostDisplay = show.hosts ? show.hosts.join(", ") : show.host;
  const { episodes } = usePodcastEpisodes();

  // Count episodes for this show
  const episodeCount = episodes.filter(
    (episode) => episode.show === show.name
  ).length;

  const handleGoToShow = () => {
    if (onGoToShow) {
      onGoToShow(show.name);
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Artwork Section */}
      {show.artwork && (
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: show.artwork }}
            style={styles.artwork}
            resizeMode="cover"
          />
        </View>
      )}

      {hostDisplay && (
        <Text style={styles.hostText}>
          HOSTED BY: {hostDisplay.toUpperCase()}
        </Text>
      )}

      <Text style={styles.description}>{show.description}</Text>

      {show.tagline && (
        <View style={styles.taglineContainer}>
          <Text style={styles.taglineText}>"{show.tagline}"</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.sectionLabel}>FREQUENCY</Text>
        <Text style={styles.sectionValue}>{show.frequency}</Text>
      </View>

      {show.duration && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>DURATION</Text>
          <Text style={styles.sectionValue}>{show.duration}</Text>
        </View>
      )}

      {show.genres && show.genres.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>GENRES</Text>
          <View style={styles.genresContainer}>
            {show.genres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {show.specialSegments && show.specialSegments.length > 0 && (
        <View>
          <Text style={styles.sectionLabel}>SPECIAL SEGMENTS</Text>
          {show.specialSegments.map((segment, index) => (
            <View key={index} style={styles.segmentItem}>
              <Text style={styles.segmentName}>{segment.name}</Text>
              <Text style={styles.segmentDescription}>
                {segment.description}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Go to Show Button */}
      {onGoToShow && (
        <TouchableOpacity
          style={styles.goToShowButton}
          onPress={handleGoToShow}
        >
          <Text style={styles.goToShowText}>
            VIEW EPISODES ({episodeCount})
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
  },
  artworkContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  hostText: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000",
    letterSpacing: 2,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
    color: "#666",
    textAlign: "center",
  },
  taglineContainer: {
    backgroundColor: "#fff8ec",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: "#D5851F",
  },
  taglineText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#D5851F",
    letterSpacing: 0.3,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: "#D5851F",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionValue: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreTag: {
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D5851F",
  },
  genreText: {
    color: "#D5851F",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  segmentItem: {
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
  },
  segmentName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  segmentDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  goToShowButton: {
    backgroundColor: "#D5851F",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
    shadowColor: "#D5851F",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  goToShowText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
