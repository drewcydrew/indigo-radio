import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { PodcastEpisode } from "../types/types";
import useShowDetails from "../hooks/useShowDetails";

interface PodcastEpisodeDisplayProps {
  episode: PodcastEpisode | null;
  visible: boolean;
  onClose: () => void;
  onPlay: (episodeId: string) => void;
  onShowDetails?: (showName: string) => void;
}

export default function PodcastEpisodeDisplay({
  episode,
  visible,
  onClose,
  onPlay,
  onShowDetails,
}: PodcastEpisodeDisplayProps) {
  const { findShowByName } = useShowDetails();

  if (!episode) return null;

  const showDef = findShowByName(episode.show);
  const artwork = showDef?.artwork;
  const artist =
    showDef?.host ||
    (showDef?.hosts ? showDef.hosts.join(", ") : "Indigo FM Podcast");

  const handlePlay = () => {
    onPlay(episode.id);
    onClose();
  };

  const handleViewShow = () => {
    if (showDef && onShowDetails) {
      onClose(); // Close this modal first

      // Use a platform-specific delay to ensure modal is fully closed
      const delay = Platform.OS === "ios" ? 500 : 200;
      setTimeout(() => {
        onShowDetails(episode.show);
      }, delay);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Episode Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Artwork */}
          <View style={styles.artworkContainer}>
            {artwork ? (
              <Image
                source={{ uri: artwork }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderArtwork}>
                <Text style={styles.placeholderIcon}>PODCAST</Text>
              </View>
            )}
          </View>

          {/* Episode Info */}
          <View style={styles.episodeInfo}>
            <Text style={styles.showName}>{episode.show.toUpperCase()}</Text>
            <Text style={styles.episodeTitle}>{episode.title}</Text>
            <Text style={styles.artistName}>Hosted by {artist}</Text>

            {episode.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.description}>{episode.description}</Text>
              </View>
            )}

            {/* View Show Button */}
            {showDef && onShowDetails && (
              <View style={styles.viewShowContainer}>
                <TouchableOpacity
                  style={styles.viewShowButton}
                  onPress={handleViewShow}
                >
                  <Text style={styles.viewShowButtonText}>
                    VIEW SHOW DETAILS
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Play Button */}
        <View style={styles.playButtonContainer}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
            <Text style={styles.playButtonText}>▶ Play Episode</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#000",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
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
  placeholderArtwork: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#666",
    letterSpacing: 1,
  },
  episodeInfo: {
    alignItems: "center",
  },
  showName: {
    fontWeight: "700",
    color: "#000",
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 2,
    textAlign: "center",
  },
  episodeTitle: {
    fontWeight: "700",
    fontSize: 24,
    marginBottom: 12,
    color: "#000",
    letterSpacing: 0.3,
    textAlign: "center",
    lineHeight: 32,
  },
  artistName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  descriptionContainer: {
    width: "100%",
    marginTop: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  description: {
    color: "#666",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
  },
  playButtonContainer: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  playButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  viewShowContainer: {
    width: "100%",
    marginTop: 24,
    alignItems: "center",
  },
  viewShowButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  viewShowButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
