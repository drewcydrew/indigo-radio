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
    color: "#FFFBE7",
    letterSpacing: 0.3,
  },
  clearButton: {
    backgroundColor: "#DD8210",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearButtonText: {
    color: "#FFFBE7",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dropdownButton: {
    backgroundColor: "#008080",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFBE7",
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
    color: "#FFFBE7",
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#e2e8f0",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#FFFBE7",
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
    backgroundColor: "#DD8210",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: Platform.OS === "web" ? 200 : "auto",
    borderWidth: 1,
    borderColor: "#FFFBE7",
  },
  showChipText: {
    color: "#FFFBE7",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  removeChipButton: {
    backgroundColor: "#008080",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeChipText: {
    color: "#FFFBE7",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#008080",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 2,
    borderBottomColor: "#FFFBE7",
    backgroundColor: "#008080",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFBE7",
  },
  doneButton: {
    fontSize: 16,
    color: "#FFFBE7",
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#DD8210",
    borderRadius: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#008080",
  },
  scrollContent: {
    paddingVertical: 8,
  },
  showItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFBE7",
    flexDirection: "row",
    alignItems: "center",
  },
  selectedShowItem: {
    backgroundColor: "#DD8210",
  },
  showItemContent: {
    flex: 1,
  },
  showText: {
    fontSize: 16,
    color: "#FFFBE7",
    fontWeight: "500",
  },
  selectedShowText: {
    fontWeight: "700",
    color: "#FFFBE7",
  },
  checkboxContainer: {
    padding: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFBE7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#008080",
  },
  checkedCheckbox: {
    backgroundColor: "#DD8210",
    borderColor: "#DD8210",
  },
  checkmark: {
    color: "#FFFBE7",
    fontSize: 16,
    fontWeight: "700",
  },
});
