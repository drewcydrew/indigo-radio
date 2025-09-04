import React from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ShowDefinition } from "../types/types";

interface ShowDetailsModalProps {
  show: ShowDefinition;
  onClose: () => void;
  onGoToShow?: (showName: string) => void;
}

export default function ShowDetailsModal({
  show,
  onClose,
  onGoToShow,
}: ShowDetailsModalProps) {
  const hostDisplay = show.hosts ? show.hosts.join(", ") : show.host;

  const handleGoToShow = () => {
    if (onGoToShow) {
      onGoToShow(show.name);
      onClose();
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{show.name}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.doneButtonContainer}
          >
            <Text style={styles.doneButton}>DONE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
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
              <Text style={styles.goToShowText}>VIEW EPISODES</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    color: "#fff",
    letterSpacing: 0.5,
  },
  doneButtonContainer: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  doneButton: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    padding: 20,
  },
  hostText: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    color: "#fff",
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
    color: "#ccc",
  },
  taglineContainer: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 0,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: "#fff",
  },
  taglineText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#fff",
    letterSpacing: 0.3,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    color: "#888",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreTag: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#555",
  },
  genreText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  segmentItem: {
    marginBottom: 16,
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 0,
  },
  segmentName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  segmentDescription: {
    fontSize: 13,
    color: "#ccc",
    lineHeight: 18,
  },
  goToShowButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0,
    marginTop: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  goToShowText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
