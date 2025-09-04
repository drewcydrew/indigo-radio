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
}

export default function ShowDetailsModal({
  show,
  onClose,
}: ShowDetailsModalProps) {
  const hostDisplay = show.hosts ? show.hosts.join(", ") : show.host;

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
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.doneButton}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {hostDisplay && (
            <Text style={styles.hostText}>Hosted by: {hostDisplay}</Text>
          )}

          <Text style={styles.description}>{show.description}</Text>

          {show.tagline && (
            <View style={styles.taglineContainer}>
              <Text style={styles.taglineText}>"{show.tagline}"</Text>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.sectionLabel}>Frequency</Text>
            <Text style={styles.sectionValue}>{show.frequency}</Text>
          </View>

          {show.duration && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>Duration</Text>
              <Text style={styles.sectionValue}>{show.duration}</Text>
            </View>
          )}

          {show.genres && show.genres.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>Genres</Text>
              <View style={styles.genresContainer}>
                {show.genres.map((genre, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {show.specialSegments && show.specialSegments.length > 0 && (
            <View>
              <Text style={styles.sectionLabel}>Special Segments</Text>
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
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  doneButton: {
    fontSize: 18,
    color: "#007AFF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  hostText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#007AFF",
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  taglineContainer: {
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  taglineText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#007AFF",
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#666",
  },
  sectionValue: {
    fontSize: 14,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  genreTag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  genreText: {
    color: "#1976d2",
    fontSize: 12,
  },
  segmentItem: {
    marginBottom: 8,
  },
  segmentName: {
    fontSize: 14,
    fontWeight: "500",
  },
  segmentDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
});
