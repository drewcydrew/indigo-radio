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
    backgroundColor: "#008080",
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
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    borderWidth: 2,
    borderColor: "#FFFBE7",
  },
  hostText: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 16,
    color: "#FFFBE7",
    letterSpacing: 2,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
    color: "#e2e8f0",
    textAlign: "center",
  },
  taglineContainer: {
    backgroundColor: "#008080",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: "#DD8210",
    borderWidth: 2,
    borderColor: "#FFFBE7",
  },
  taglineText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#FFFBE7",
    letterSpacing: 0.3,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: "#FFFBE7",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionValue: {
    fontSize: 16,
    color: "#FFFBE7",
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
    borderColor: "#FFFBE7",
  },
  genreText: {
    color: "#FFFBE7",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  segmentItem: {
    marginBottom: 16,
    backgroundColor: "#008080",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFBE7",
  },
  segmentName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFBE7",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  segmentDescription: {
    fontSize: 13,
    color: "#e2e8f0",
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
    color: "#FFFBE7",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  episodeItem: {
    padding: 20,
    backgroundColor: "#008080",
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 2,
    borderColor: "#FFFBE7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  episodeArtworkContainer: {
    marginRight: 16,
  },
  episodeArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  episodePlaceholderArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#FFFBE7",
    alignItems: "center",
    justifyContent: "center",
  },
  episodePlaceholderIcon: {
    fontSize: 10,
    fontWeight: "700",
    color: "#008080",
    letterSpacing: 0.5,
  },
  episodeInfo: {
    flex: 1,
    marginRight: 16,
    minWidth: 0,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFBE7",
    marginBottom: 6,
    lineHeight: 20,
  },
  episodeDescription: {
    fontSize: 13,
    color: "#e2e8f0",
    lineHeight: 18,
    fontStyle: "italic",
    opacity: 0.8,
  },
  episodePlayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DD8210",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#DD8210",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  episodePlayButtonText: {
    color: "#FFFBE7",
    fontSize: 16,
    fontWeight: "600",
  },
  noEpisodesContainer: {
    marginTop: 32,
    padding: 24,
    backgroundColor: "#008080",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFBE7",
  },
  noEpisodesText: {
    fontSize: 16,
    color: "#FFFBE7",
    textAlign: "center",
    fontStyle: "italic",
  },
  goToShowButton: {
    backgroundColor: "#DD8210",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
    shadowColor: "#DD8210",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  goToShowText: {
    color: "#FFFBE7",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
