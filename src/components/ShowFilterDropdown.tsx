import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";

interface ShowFilterDropdownProps {
  shows: string[];
  selectedShow: string | null;
  onShowChange: (showName: string | null) => void;
  onClearFilter: () => void;
}

export default function ShowFilterDropdown({
  shows,
  selectedShow,
  onShowChange,
  onClearFilter,
}: ShowFilterDropdownProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleShowSelect = (showName: string) => {
    onShowChange(showName);
    setIsModalVisible(false);
  };

  const displayText =
    selectedShow && selectedShow !== "" ? selectedShow : "Select a show...";

  return (
    <>
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterLabel}>Filter by Show:</Text>
          {selectedShow && selectedShow !== "" && (
            <TouchableOpacity
              onPress={onClearFilter}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>CLEAR</Text>
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
              (!selectedShow || selectedShow === "") && styles.placeholderText,
            ]}
          >
            {displayText}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Show</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <TouchableOpacity
              style={[
                styles.showItem,
                (!selectedShow || selectedShow === "") &&
                  styles.selectedShowItem,
              ]}
              onPress={() => {
                onShowChange("");
                setIsModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.showText,
                  (!selectedShow || selectedShow === "") &&
                    styles.selectedShowText,
                ]}
              >
                All Shows
              </Text>
            </TouchableOpacity>

            {shows.map((show) => (
              <TouchableOpacity
                key={show}
                style={[
                  styles.showItem,
                  selectedShow === show && styles.selectedShowItem,
                ]}
                onPress={() => handleShowSelect(show)}
              >
                <Text
                  style={[
                    styles.showText,
                    selectedShow === show && styles.selectedShowText,
                  ]}
                >
                  {show}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
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
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
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
  },
  selectedShowItem: {
    backgroundColor: "#f8f8f8",
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
});
