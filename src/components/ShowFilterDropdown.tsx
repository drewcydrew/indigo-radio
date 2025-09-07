import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native";

interface ShowFilterDropdownProps {
  shows: string[];
  selectedShows: string[];
  onShowsChange: (showNames: string[]) => void;
  onClearFilter: () => void;
}

export default function ShowFilterDropdown({
  shows,
  selectedShows,
  onShowsChange,
  onClearFilter,
}: ShowFilterDropdownProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleShowToggle = (showName: string) => {
    if (selectedShows.includes(showName)) {
      // Remove show from selection
      const newSelection = selectedShows.filter((s) => s !== showName);
      onShowsChange(newSelection);
    } else {
      // Add show to selection
      onShowsChange([...selectedShows, showName]);
    }
  };

  const handleShowSelect = (showName: string) => {
    handleShowToggle(showName);
    setIsModalVisible(false);
  };

  const displayText = () => {
    if (selectedShows.length === 0) {
      return "Select shows...";
    } else if (selectedShows.length === 1) {
      return selectedShows[0];
    } else {
      return `${selectedShows.length} shows selected`;
    }
  };

  return (
    <>
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterLabel}>Filter by Shows:</Text>
          {selectedShows.length > 0 && (
            <TouchableOpacity
              onPress={onClearFilter}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>CLEAR ALL</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text
            style={[
              styles.dropdownText,
              selectedShows.length === 0 && styles.placeholderText,
            ]}
          >
            {displayText()}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {/* Show selected shows as chips */}
        {selectedShows.length > 0 && (
          <View style={styles.selectedShowsContainer}>
            {selectedShows.map((show) => (
              <View key={show} style={styles.showChip}>
                <Text style={styles.showChipText}>{show}</Text>
                <TouchableOpacity
                  onPress={() => handleShowToggle(show)}
                  style={styles.removeChipButton}
                >
                  <Text style={styles.removeChipText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Shows</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {shows.map((show) => {
              const isSelected = selectedShows.includes(show);
              return (
                <View
                  key={show}
                  style={[
                    styles.showItem,
                    isSelected && styles.selectedShowItem,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.showItemContent}
                    onPress={() => handleShowSelect(show)}
                  >
                    <Text
                      style={[
                        styles.showText,
                        isSelected && styles.selectedShowText,
                      ]}
                    >
                      {show}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleShowToggle(show)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkedCheckbox,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
    width: "100%",
    maxWidth: "100%",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.3,
  },
  clearButton: {
    backgroundColor: "#ff0000",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dropdownButton: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
    width: "100%",
    maxWidth: "100%",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  selectedShowsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
    width: "100%",
    maxWidth: "100%",
  },
  showChip: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: Platform.OS === "web" ? 200 : "auto",
  },
  showChipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  removeChipButton: {
    backgroundColor: "#333",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  doneButton: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#000",
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  showItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },
  selectedShowItem: {
    backgroundColor: "#f8f8f8",
  },
  showItemContent: {
    flex: 1,
  },
  showText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedShowText: {
    fontWeight: "700",
    color: "#000",
  },
  checkboxContainer: {
    padding: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkedCheckbox: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
