import React, { useState, useCallback, useMemo } from "react";
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
import { ShowDefinition, PodcastEpisode } from "../types/types";
import usePodcastEpisodes from "../hooks/usePodcastEpisodes";
import { usePlayer } from "../contexts/PlayerContext";
import { audioService } from "../services/AudioService";
import PodcastEpisodeDisplay from "../components/PodcastEpisodeDisplay";

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

  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);

  const { setCurrentContent, setPlayerVisible } = usePlayer();
  const { episodes } = usePodcastEpisodes();

  const hostDisplay = show.hosts ? show.hosts.join(", ") : show.host;

  // Filter episodes for this show
  const showEpisodes = useMemo(() => {
    return episodes.filter((episode) => episode.show === show.name);
  }, [episodes, show.name]);

  const handleGoToShow = () => {
    if (onGoToShow) {
      onGoToShow(show.name);
      navigation.goBack();
    }
  };

  const playEpisode = useCallback(
    async (episodeId: string) => {
      const episode = episodes.find((ep) => ep.id === episodeId);
      if (episode) {
        try {
          // Check if we're on web and warn about potential CORS issues
          if (Platform.OS === "web") {
            console.warn(
              "Playing podcasts on web may be limited due to CORS policies"
            );
          }

          // Update player context first
          setCurrentContent({ type: "podcast", episode });
          setPlayerVisible(true);

          // For web, set up the audio service track info
          if (Platform.OS === "web") {
            await audioService.add({
              id: episode.id,
              url: episode.url,
              title: episode.title,
              artist: episode.show,
              artwork: show.artwork,
            });
          }
        } catch (error) {
          console.error("Error playing episode:", error);
        }
      }
    },
    [episodes, show.artwork, setCurrentContent, setPlayerVisible]
  );

  const handleEpisodePress = useCallback((episode: PodcastEpisode) => {
    setSelectedEpisode(episode);
    setShowEpisodeModal(true);
  }, []);

  const handleCloseEpisodeModal = useCallback(() => {
    setShowEpisodeModal(false);
    setTimeout(
      () => {
        setSelectedEpisode(null);
      },
      Platform.OS === "ios" ? 600 : 200
    );
  }, []);

  const renderEpisode = useCallback(
    ({ item: episode }: { item: PodcastEpisode }) => {
      return (
        <TouchableOpacity
          style={styles.episodeItem}
          onPress={() => handleEpisodePress(episode)}
        >
          {/* Artwork */}
          <View style={styles.episodeArtworkContainer}>
            {show.artwork ? (
              <Image
                source={{ uri: show.artwork }}
                style={styles.episodeArtwork}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.episodePlaceholderArtwork}>
                <Text style={styles.episodePlaceholderIcon}>PODCAST</Text>
              </View>
            )}
          </View>

          {/* Episode Info */}
          <View style={styles.episodeInfo}>
            <Text style={styles.episodeTitle}>{episode.title}</Text>
            {episode.description && (
              <Text style={styles.episodeDescription} numberOfLines={2}>
                {episode.description}
              </Text>
            )}
          </View>

          {/* Play Button */}
          <TouchableOpacity
            style={styles.episodePlayButton}
            onPress={() => playEpisode(episode.id)}
          >
            <Text style={styles.episodePlayButtonText}>▶</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [show.artwork, handleEpisodePress, playEpisode]
  );

  const renderEpisodesSection = () => {
    if (showEpisodes.length === 0) {
      return (
        <View style={styles.noEpisodesContainer}>
          <Text style={styles.noEpisodesText}>
            No episodes available for this show yet.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.episodesSection}>
        <Text style={styles.episodesSectionTitle}>
          EPISODES ({showEpisodes.length})
        </Text>
        <FlatList
          data={showEpisodes}
          renderItem={renderEpisode}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
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

      {/* Episodes Section */}
      {renderEpisodesSection()}

      {/* Go to Show Button */}
      {onGoToShow && (
        <TouchableOpacity
          style={styles.goToShowButton}
          onPress={handleGoToShow}
        >
          <Text style={styles.goToShowText}>VIEW ALL EPISODES</Text>
        </TouchableOpacity>
      )}

      {/* Episode Display Modal */}
      {selectedEpisode && showEpisodeModal && (
        <PodcastEpisodeDisplay
          episode={selectedEpisode}
          visible={showEpisodeModal}
          onClose={handleCloseEpisodeModal}
          onPlay={playEpisode}
        />
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
  episodesSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  episodesSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    color: "#D5851F",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  episodeItem: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 3,
    borderLeftColor: "#D5851F",
  },
  episodeArtworkContainer: {
    marginRight: 12,
  },
  episodeArtwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  episodePlaceholderArtwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  episodePlaceholderIcon: {
    fontSize: 8,
    fontWeight: "700",
    color: "#666",
    letterSpacing: 0.5,
  },
  episodeInfo: {
    flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
    lineHeight: 18,
  },
  episodeDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    fontStyle: "italic",
  },
  episodePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D5851F",
    alignItems: "center",
    justifyContent: "center",
  },
  episodePlayButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  noEpisodesContainer: {
    marginTop: 32,
    padding: 24,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    alignItems: "center",
  },
  noEpisodesText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
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
